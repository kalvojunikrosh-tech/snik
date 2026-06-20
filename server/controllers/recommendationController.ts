import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { GoogleGenAI, Type } from '@google/genai';

export async function getRecommendations(req: Request, res: Response) {
  try {
    const { budget, brand, shoeType, color, activity } = req.body;

    // Fetch all products with categories and reviews
    const products = await prisma.product.findMany({
      include: {
        category: true,
        reviews: true,
      },
    });

    if (products.length === 0) {
      res.status(200).json({
        generalOverview: "No premium sneakers found in the Sneakerverse system database at this absolute vector. Please run seed procedures.",
        recommendations: [],
      });
      return;
    }

    // Scoring algorithm
    const scoredProducts = products.map((product) => {
      let score = 50; // Starting baseline

      // 1. Budget scoring
      // budget value can be: 'under-1000', '1000-2000', 'over-2000'
      const price = product.price;
      if (budget === 'under-1000') {
        if (price < 1000) score += 20;
        else if (price <= 1500) score += 5;
        else score -= 15;
      } else if (budget === '1000-2000') {
        if (price >= 1000 && price <= 2000) score += 20;
        else if (price < 1000) score += 10; // affordable is totally okay
        else score -= 10;
      } else if (budget === 'over-2000') {
        if (price > 2000) score += 20;
        else if (price >= 1500) score += 10;
        else score -= 10;
      }

      // 2. Brand scoring
      if (brand && brand !== 'All') {
        if (product.brand.toLowerCase() === brand.toLowerCase()) {
          score += 25;
        } else {
          score -= 10;
        }
      }

      // 3. Shoe Type (Category/Slug) scoring
      if (shoeType && shoeType !== 'All') {
        if (
          product.category.slug.toLowerCase() === shoeType.toLowerCase() ||
          product.category.name.toLowerCase().includes(shoeType.toLowerCase())
        ) {
          score += 25;
        } else {
          score -= 5;
        }
      }

      // 4. Color scoring
      if (color && color !== 'All') {
        const colorLower = color.toLowerCase();
        const colorwayLower = product.colorway.toLowerCase();
        const descLower = product.description.toLowerCase();
        const nameLower = product.name.toLowerCase();

        if (colorwayLower.includes(colorLower) || nameLower.includes(colorLower)) {
          score += 15;
        } else if (descLower.includes(colorLower)) {
          score += 5;
        }
      }

      // 5. Activity scoring matching keywords inside description and brand identity
      if (activity) {
        const actLower = activity.toLowerCase();
        const descLower = product.description.toLowerCase();
        const nameLower = product.name.toLowerCase();

        // Match activities with high-tech sneaker paradigms
        if (
          actLower.includes('combat') || 
          actLower.includes('brutalist') || 
          actLower.includes('heavy') || 
          actLower.includes('protection') || 
          actLower.includes('armor') ||
          actLower.includes('hazard')
        ) {
          if (product.category.slug === 'exo-brutalist') score += 15;
        }
        if (
          actLower.includes('stealth') || 
          actLower.includes('minimalist') || 
          actLower.includes('clean') || 
          actLower.includes('silent') || 
          actLower.includes('office') ||
          actLower.includes('formal')
        ) {
          if (product.category.slug === 'chrono-minimalist') score += 15;
        }
        if (
          actLower.includes('glow') || 
          actLower.includes('neon') || 
          actLower.includes('future') || 
          actLower.includes('metaverse') || 
          actLower.includes('party') ||
          actLower.includes('social') ||
          actLower.includes('active')
        ) {
          if (product.category.slug === 'cyber-neon') score += 15;
        }

        // Description/Name plain text matches
        if (descLower.includes(actLower) || nameLower.includes(actLower)) {
          score += 10;
        }
      }

      // Cap score boundary
      const finalScore = Math.max(0, Math.min(100, score));

      return {
        product,
        score: finalScore,
      };
    });

    // Sort by score desc
    scoredProducts.sort((a, b) => b.score - a.score || b.product.price - a.product.price);

    // Filter to top 3 matching items
    const topScored = scoredProducts.slice(0, 3);

    // Initialize Gemini Client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Providing fallback algorithmic output.");
      const items = topScored.map(({ product, score }) => ({
        product,
        score,
        insight: `Highly matches your selection containing brand ${product.brand} in colorway ${product.colorway}. Fully performance-rated for ${activity || 'daily operations'}.`,
        stylingTip: `Style standard techwear pieces, neutral utility joggers, or high-contrast modern cargo gear.`,
      }));

      res.status(200).json({
        generalOverview: "Welcome to Sneakerverse AI Recommendation Stylist! Note that the Gemini API keys are currently offline, but our local cybernetic catalog scanner has calculated the following algorithmic recommendations for your profile.",
        recommendations: items,
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const productsContext = topScored.map((ts) => ({
      id: ts.product.id,
      name: ts.product.name,
      brand: ts.product.brand,
      price: ts.product.price,
      colorway: ts.product.colorway,
      category: ts.product.category.name,
      description: ts.product.description,
      score: ts.score,
    }));

    const userProfilePrompt = `
You are the advanced Sneakerverse AI Recommendation Stylist in a futuristic cyberpunk world.
Analyze the user's fashion & practical requirement metrics and formulate a tailored stylistic brief:
- User Budget Level: ${budget}
- Preferred Brand: ${brand}
- Style/Type Class: ${shoeType}
- Target Color Palette: ${color}
- Core Activity Scenario: ${activity}

Here are our top warehouse-matched products based on database score:
${JSON.stringify(productsContext, null, 2)}

Provide your analysis in clean JSON aligning to the requested format:
1. "generalOverview": A high-energy, immersive personal greeting summarizing why this selection coordinates beautifully with their designated activity (${activity}) and aesthetic (max 3 sentences). Refer to them as a digital explorer.
2. "shoes": For each of the recommended shoes from the parameters:
   - "productId": Must match the ID from the payload exactly.
   - "score": The final adjusted score reflecting styling synergy (integer, 0-100).
   - "insight": A detailed stylist pitch detailing how the shoe's core physical attributes match their designated activity (${activity}) & color aesthetic (max 2 sentences).
   - "stylingTip": Highly descriptive, premium styling instructions with specific techwear garments or color arrangements.
`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userProfilePrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generalOverview: {
              type: Type.STRING,
              description: "High-end style introduction from the Sneakerverse Personal Stylist AI.",
            },
            shoes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  insight: { type: Type.STRING },
                  stylingTip: { type: Type.STRING },
                },
                required: ['productId', 'score', 'insight', 'stylingTip'],
              },
            },
          },
          required: ['generalOverview', 'shoes'],
        },
      },
    });

    let aiResult;
    try {
      if (geminiResponse.text) {
        aiResult = JSON.parse(geminiResponse.text.trim());
      }
    } catch (parseErr) {
      console.error("Gemini JSON output parsing failed, response raw:", geminiResponse.text, parseErr);
    }

    if (!aiResult || !aiResult.shoes || aiResult.shoes.length === 0) {
      // Fallback
      const items = topScored.map(({ product, score }) => ({
        product,
        score,
        insight: `Matches your choice of brand ${product.brand} and price. Excellent design for "${activity}".`,
        stylingTip: `Best matched with minimal lines, light or dark tech-utility joggers, and contrasting overlays.`,
      }));

      res.status(200).json({
        generalOverview: `We've matched these premium selections for ${activity} exploration in the Sneakerverse!`,
        recommendations: items,
      });
      return;
    }

    // Assemble database sneaker parameters and AI styled descriptions
    const recommendations = aiResult.shoes.map((aiShoe: any) => {
      const match = topScored.find((ts) => ts.product.id === aiShoe.productId);
      if (match) {
        return {
          product: match.product,
          score: Math.max(1, Math.min(100, aiShoe.score || match.score)),
          insight: aiShoe.insight,
          stylingTip: aiShoe.stylingTip,
        };
      }
      return null;
    }).filter(Boolean);

    if (recommendations.length === 0) {
      // Fallback if mismatch
      const items = topScored.map(({ product, score }) => ({
        product,
        score,
        insight: `Engineered perfectly to withstand ${activity}. Adorns a gorgeous ${product.colorway} colorway.`,
        stylingTip: `Pairs gracefully with slim fit cyber garments, utility waistcoats, and sleek visor accessories.`,
      }));

      res.status(200).json({
        generalOverview: aiResult.generalOverview || `Here are our matched recommendations for your digital adventures in a ${color} aesthetic.`,
        recommendations: items,
      });
    } else {
      res.status(200).json({
        generalOverview: aiResult.generalOverview,
        recommendations,
      });
    }

  } catch (err: any) {
    console.error("AI recommendation endpoint crash: ", err);
    res.status(500).json({ error: err.message || 'Error executing recommendations' });
  }
}
