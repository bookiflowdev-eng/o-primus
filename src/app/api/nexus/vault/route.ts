import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// SAUVEGARDER UN COMPOSANT
export async function POST(req: Request) {
  try {
    const { title, source_url, html_content } = await req.json();

    if (!html_content) return NextResponse.json({ error: "Aucun code HTML" }, { status: 400 });

    const { data, error } = await supabase
      .from('nexus_components')
      .insert([{ title: title || 'Clone SOTY', source_url: source_url || 'Manuelle', html_content }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// LIRE TOUS LES COMPOSANTS
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('nexus_components')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🔴 NOUVEAU : MODIFIER LE NOM D'UNE ARCHITECTURE (RENOMMER)
export async function PATCH(req: Request) {
  try {
    const { id, title } = await req.json();
    
    const { error } = await supabase
      .from('nexus_components')
      .update({ title })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// SUPPRIMER UN COMPOSANT
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const { error } = await supabase.from('nexus_components').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}