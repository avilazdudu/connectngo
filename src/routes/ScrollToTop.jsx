import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Garante que toda navegação entre rotas comece no topo da página.
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  // Evita que o navegador restaure a rolagem antiga (ex.: botão voltar).
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    // Preserva âncoras internas (#id), quando existirem.
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}

export default ScrollToTop
