import { NextResponse } from 'next/server';

/**
 * Endpoint de signalisation WebRTC.
 * Rôle : Négocier les clés SDP (Session Description Protocol) entre le navigateur 
 * client de l'utilisateur et le conteneur Google Cloud Run (Puppeteer).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // TODO: Brancher ici l'API Google Cloud Run (Mission 1 - Étape Ops)
    // En attendant le déploiement Cloud, l'endpoint accuse réception du payload P2P.
    
    return NextResponse.json({
      status: 'signaling_ready',
      message: 'Nexus Visual Cortex signaling active.',
      received_offer: !!body.sdp
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid WebRTC payload format.' }, 
      { status: 400 }
    );
  }
}