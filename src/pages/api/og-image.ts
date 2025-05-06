// src/pages/api/og-image.ts
import type { APIRoute } from 'astro';
import { createCanvas, loadImage } from 'canvas';
import path from 'path';
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get('title') || '@grumpycatyo-collab';
  const subtitle = url.searchParams.get('subtitle') || 'Software Engineer';
  const theme = url.searchParams.get('theme') || 'dark'; // Allow theme parameter
  
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Colors matching your website
  const colors = {
    dark: {
      bg: '#121212',
      text: '#f3f4f6',
      accent: '#60a5fa',
      muted: '#9ca3af',
      border: '#374151'
    },
    light: {
      bg: '#ffffff',
      text: '#121212',
      accent: '#3a86ff',
      muted: '#6b7280',
      border: '#e5e7eb'
    }
  };
  
  const currentTheme = theme === 'light' ? colors.light : colors.dark;
  
  // Background
  ctx.fillStyle = currentTheme.bg;
  ctx.fillRect(0, 0, width, height);
  
  // Add subtle grid pattern to match website aesthetic
  ctx.strokeStyle = currentTheme.border;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.1;
  
  // Draw subtle grid lines
  // const gridSize = 50;
  // for (let x = 0; x <= width; x += gridSize) {
  //   ctx.beginPath();
  //   ctx.moveTo(x, 0);
  //   ctx.lineTo(x, height);
  //   ctx.stroke();
  // }
  
  // for (let y = 0; y <= height; y += gridSize) {
  //   ctx.beginPath();
  //   ctx.moveTo(0, y);
  //   ctx.lineTo(width, y);
  //   ctx.stroke();
  // }
  
  ctx.globalAlpha = 1;
  
  // Try to load avatar
  try {
    const avatarPath = path.resolve('public', 'grumpy_cat.jpeg');
    const avatar = await loadImage(avatarPath);
    
    // Draw circular avatar with border
    const avatarSize = 200;
    const avatarX = width / 2;
    const avatarY = 180;
    
    // Draw accent-colored ring around avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2 + 8, 0, Math.PI * 2, true);
    ctx.fillStyle = currentTheme.accent;
    ctx.fill();
    ctx.restore();
    
    // Draw circular avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();
  } catch (e) {
    console.error('Error loading avatar image:', e);
  }
  
  // Title - use a font similar to your site's headings
  ctx.font = 'bold 70px sans-serif';
  ctx.fillStyle = currentTheme.text;
  ctx.textAlign = 'center';
  
  // Handle long titles by splitting text
  const maxWidth = width - 200; // Leave some margin
  const words = title.split(' ');
  let line = '';
  let lines = [];
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  
  // Draw each line of text
  let y = 350;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], width / 2, y);
    y += 80; // Adjust spacing between lines
  }
  
  // Subtitle
  ctx.font = '36px sans-serif';
  ctx.fillStyle = currentTheme.muted;
  ctx.fillText(subtitle, width / 2, y + 40);
  
  // Add website URL at bottom
  ctx.font = '28px monospace'; // Use monospace font like JetBrains Mono
  ctx.fillStyle = currentTheme.accent;
  ctx.fillText('max-plamadeala.com', width / 2, height - 40);
  
  // Add accent color accent bar at top
  const accentBarHeight = 12;
  ctx.fillStyle = currentTheme.accent;
  ctx.fillRect(0, 0, width, accentBarHeight);
  
  // Return the PNG
  return new Response(canvas.toBuffer(), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
};