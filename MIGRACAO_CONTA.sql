-- =====================================================================
-- MIGRAÇÃO — Exclusão de conta (doador, ONG e empresa)
-- Rodar no SQL Editor do Supabase.
--
-- O que faz:
--   1. Guarda o nome e o CNPJ da ONG nas doações recebidas (colunas novas em
--      transacoes), para o doador manter o comprovante mesmo que a ONG exclua a conta.
--   2. Cria a função excluir_conta(), que remove os dados da conta e anonimiza o
--      registro em usuarios (as transações são mantidas como registro financeiro).
-- =====================================================================

BEGIN;

ALTER TABLE transacoes
    ADD COLUMN IF NOT EXISTS destino_nome      TEXT,
    ADD COLUMN IF NOT EXISTS destino_documento TEXT;

-- Preenche as doações que já existem
UPDATE transacoes t
SET destino_nome      = u.nome,
    destino_documento = o.cnpj
FROM usuarios u
LEFT JOIN ongs o ON o.id = u.id
WHERE t.tipo = 'doacao'
  AND t.destino_usuario_id = u.id
  AND t.destino_nome IS NULL;

CREATE OR REPLACE FUNCTION excluir_conta(p_usuario_id BIGINT, p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tipo  TEXT;
    v_email TEXT;
BEGIN
    SELECT tipo, email INTO v_tipo, v_email
    FROM usuarios
    WHERE id = p_usuario_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Conta não encontrada.';
    END IF;

    -- Confirmação: o e-mail informado precisa ser o da conta
    IF lower(coalesce(v_email, '')) <> lower(trim(coalesce(p_email, ''))) THEN
        RAISE EXCEPTION 'O e-mail informado não confere com o da conta.';
    END IF;

    -- Interações no mural (qualquer tipo de conta)
    DELETE FROM post_curtidas     WHERE usuario_id = p_usuario_id;
    DELETE FROM post_comentarios  WHERE usuario_id = p_usuario_id;

    IF v_tipo = 'ong' THEN
        -- Guarda nome e CNPJ nas doações recebidas antes de apagar o perfil
        UPDATE transacoes t
        SET destino_nome      = u.nome,
            destino_documento = o.cnpj
        FROM usuarios u
        LEFT JOIN ongs o ON o.id = u.id
        WHERE u.id = p_usuario_id
          AND t.destino_usuario_id = p_usuario_id
          AND t.tipo = 'doacao'
          AND t.destino_nome IS NULL;

        DELETE FROM ongs_destaque WHERE ong_id = p_usuario_id;
        DELETE FROM posts         WHERE ong_id = p_usuario_id;  -- curtidas e comentários caem em cascata
        DELETE FROM ongs          WHERE id     = p_usuario_id;

    ELSIF v_tipo = 'empresa' THEN
        -- Resgates já feitos continuam no histórico, sem apontar para o produto
        UPDATE transacoes
        SET destino_produto_id = NULL
        WHERE destino_produto_id IN (SELECT id FROM produtos WHERE empresa_id = p_usuario_id);

        DELETE FROM produtos  WHERE empresa_id = p_usuario_id;
        DELETE FROM empresas  WHERE id         = p_usuario_id;
    END IF;

    -- Anonimiza o usuário. A linha continua existindo porque transacoes aponta para ela.
    UPDATE usuarios
    SET nome           = 'Conta excluída',
        email          = 'excluida-' || p_usuario_id || '@conta-excluida.invalid',
        saldo_creditos = 0
    WHERE id = p_usuario_id;
END;
$$;

GRANT EXECUTE ON FUNCTION excluir_conta(BIGINT, TEXT) TO anon, authenticated;

COMMIT;

-- Lembretes:
--  * O app usa a chave anon direto no navegador e o login confere só o e-mail, sem senha.
--    A função exige o e-mail da conta para excluir, mas isso não substitui autenticação de verdade.
--  * Se alguma tabela que eu não conheço referenciar ongs/produtos/empresas sem ON DELETE
--    CASCADE, a função falha com erro de chave estrangeira e desfaz tudo; me avise qual é.
