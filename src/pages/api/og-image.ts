import type { APIRoute } from 'astro';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';
export const prerender = false;

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
  
  // Bright yellow background like in the image
  ctx.fillStyle = '#ffde03'; // Bright yellow
  ctx.fillRect(0, 0, width, height);
  
  // Try to load avatar
  try {
    const avatarPath = path.resolve('public', 'grumpy_cat.jpeg');
    const avatar = await loadImage(avatarPath);
    
    // Draw avatar on the left side with a white border/sticker effect
    const avatarSize = 350;
    const avatarX = 220;
    const avatarY = height / 2;
    
    // White background for sticker effect
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarSize / 2 + 15, 0, Math.PI * 2, true);
    ctx.fillStyle = 'white';
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
  
  // Title - big, bold, black text aligned to the right using Inter font
  ctx.font = 'bold 72px "Cal Sans", sans-serif';
  ctx.fillStyle = '#000000'; // Black text
  ctx.textAlign = 'left';
  
  // Handle long titles by splitting text
  const textX = 450; // Position text to the right of the avatar
  const maxWidth = width - textX - 50; // Leave some margin
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
  
  // Add website URL at bottom right aligned with the title using Roboto Mono
  ctx.font = '36px "JetBrainsMono", monospace';
  ctx.fillStyle = '#000000'; // Black text for URL too
  ctx.textAlign = 'left';
  ctx.fillText('max-plamadeala.com', textX, height - 80);
  
  
  // Return the PNG
  return new Response(canvas.toBuffer(), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
};