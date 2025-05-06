import type { APIRoute } from 'astro';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
export const prerender = true;

export const GET: APIRoute = async ({ request }) => {
  // Register fonts
  try {
    registerFont(path.resolve('public', 'fonts', 'CalSans-Regular.ttf'), { family: 'Cal Sans'});
    registerFont(path.resolve('public', 'fonts', 'JetBrainsMono-Regular.ttf'), { family: 'JetBrainsMono' });
    registerFont(path.resolve('public', 'fonts', 'Inter-VariableFont_opsz,wght.ttf'), { family: 'Inter'});
  } catch (e) {
    console.error('Error registering fonts:', e);
    // Continue with system fonts if custom fonts fail to load
  }

  const url = new URL(request.url);
  const title = url.searchParams.get('title') || '@grumpycatyo-collab';
  const subtitle = url.searchParams.get('subtitle') || '';
  
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Define 5 bright colors to choose from
  const bgColors = [
    '#ffe642', // Soft yellow
    '#f0a0a0', // Soft pink/red
    '#a0d2f0', // Soft blue
    '#b8e6b8', // Soft green
    '#e7c6e2'  // Soft lavender
  ];
  // Randomly select a background color
  const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
  
  // Set the background color
  ctx.fillStyle = randomColor;
  ctx.fillRect(0, 0, width, height);
  
  // Title - big, bold, black text centered
  ctx.font = 'bold 72px "Cal Sans", sans-serif';
  ctx.fillStyle = '#000000'; // Black text
  ctx.textAlign = 'center';
  
  // Handle long titles by splitting text
  const textX = width / 2; // Center text
  const maxWidth = width - 100; // Leave some margin
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
  let y = height / 2 - ((lines.length - 1) * 80) / 2;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].trim(), textX, y);
    y += 80; // Adjust spacing between lines
  }
  
  // Add website URL and nickname at bottom
  ctx.font = '36px "JetBrainsMono", monospace';
  ctx.fillStyle = '#000000'; // Black text for URL too
  ctx.textAlign = 'center';
  ctx.fillText('max-plamadeala.com | @grumpycatyo-collab', width / 2, height - 80);
  
  // Return the PNG
  return new Response(canvas.toBuffer(), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
};