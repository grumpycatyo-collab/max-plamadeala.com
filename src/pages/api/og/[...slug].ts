import type { APIRoute } from 'astro';
import { createCanvas, registerFont } from 'canvas';
import path from 'path';
import { getCollection } from 'astro:content';

export const prerender = true;

// Function to generate OG image
async function generateOGImage(title: string) {
  try {
    registerFont(path.resolve('public', 'fonts', 'CalSans-Regular.ttf'), { family: 'Cal Sans'});
    registerFont(path.resolve('public', 'fonts', 'JetBrainsMono-Regular.ttf'), { family: 'JetBrainsMono' });
    registerFont(path.resolve('public', 'fonts', 'Inter-VariableFont_opsz,wght.ttf'), { family: 'Inter'});
  } catch (e) {
    console.error('Error registering fonts:', e);
  }
  
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
  
  // Use a fixed color based on the title to ensure consistency
  const colorIndex = Math.abs(title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % bgColors.length;
  const bgColor = bgColors[colorIndex];
  
  // Set the background color
  ctx.fillStyle = bgColor;
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
  
  return canvas.toBuffer();
}

// Generate static paths for all articles plus a default
export async function getStaticPaths() {
  const articles = await getCollection('articles');
  
  return [
    { params: { slug: 'default' } },
    ...articles.map(article => ({
      params: { slug: article.data.slug }
    }))
  ];
}

// Handle the OG image request
export const GET: APIRoute = async ({ params }) => {
  // Get the title based on slug
  let title = '@grumpycatyo-collab';
  
  if (params.slug && params.slug !== 'default') {
    // Find the article by slug
    const articles = await getCollection('articles');
    const article = articles.find(a => a.data.slug === params.slug);
    
    if (article) {
      title = article.data.title;
    }
  }
  
  const imageBuffer = await generateOGImage(title);
  
  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
};