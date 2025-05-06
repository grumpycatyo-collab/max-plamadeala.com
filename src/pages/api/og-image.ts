// src/pages/api/og-image.ts
import type { APIRoute } from 'astro';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

export const get: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || '@grumpycatyo-collab';
  const subtitle = url.searchParams.get('subtitle') || 'Software Engineer';
  
  // Set up canvas (1200x630 is a good size for most social media platforms)
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, width, height);
  
  // Try to load your cat avatar
  try {
    const avatarPath = path.resolve('public', 'grumpy_cat.jpeg');
    const avatar = await loadImage(avatarPath);
    
    // Draw circular avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, 200, 150, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, width / 2 - 150, 50, 300, 300);
    ctx.restore();
  } catch (e) {
    console.error('Error loading avatar image:', e);
  }
  
  // Title
  ctx.font = 'bold 70px Inter';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 400);
  
  // Subtitle
  ctx.font = '40px Inter';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText(subtitle, width / 2, 470);
  
  // Return the PNG
  return new Response(canvas.toBuffer(), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
};