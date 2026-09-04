import { supabase } from './supabase';

// Busca ONGs completas utilizando a View criada no Supabase
export async function getOngs() {
  const { data, error } = await supabase
    .from('vw_ongs_completas')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao buscar ONGs do Supabase:', error);
    throw error;
  }
  return data;
}

// Busca as métricas gerais da plataforma
export async function getMetricas() {
  const { data, error } = await supabase
    .from('metricas_plataforma')
    .select('*')
    .single();

  if (error) {
    console.error('Erro ao buscar métricas:', error);
    throw error;
  }
  return data;
}