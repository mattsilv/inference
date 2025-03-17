/**
 * Sample text for AI model cost estimation
 * 
 * This file contains sample text used for estimating
 * AI model processing costs in the pricing table
 */

// User messages (inputs)
export const USER_MESSAGES = [
  "I need to build a simple website for my small business. What's the best approach?",
  
  "I sell handmade leather goods like wallets, belts, and bags. I want to showcase my products and accept orders online. My budget is limited.",
  
  "I have some basic technical knowledge but I'm not a developer. Can you recommend a simple solution that won't require much coding?",
  
  "I like the website builder idea. Which one would you recommend for an e-commerce site that's easy to set up and affordable?",
  
  "That sounds good. What about SEO? How can I make sure my site ranks well in search results?"
];

// AI assistant responses (outputs)
export const AI_RESPONSES = [
  "There are several approaches to building a business website, depending on your technical skills, budget, and specific needs:\n\n1. Website builders (easiest): Services like Wix, Squarespace, or Shopify offer drag-and-drop interfaces to create professional-looking sites without coding knowledge.\n\n2. WordPress (flexible): A popular platform that offers more customization but has a steeper learning curve than website builders.\n\n3. Custom development (most control): Hiring a developer or agency to build a custom site offers maximum flexibility but is more expensive.\n\nWhat type of business do you have, and what functionality do you need on your website?",
  
  "Thanks for sharing those details about your handmade leather goods business! Based on your needs to showcase products and accept online orders with a limited budget, a website builder with e-commerce capabilities would be ideal for you.\n\nHere are some good options:\n\n1. Shopify: Specifically designed for e-commerce with excellent product management and payment processing. Monthly plans start around $29.\n\n2. Square Online: Good for small inventories with competitive transaction fees and a free tier to start.\n\n3. Wix E-commerce: User-friendly with good-looking templates specifically for artisan products.\n\nAll of these options require minimal technical knowledge and include hosting, security, and payment processing, so you won't need to manage those aspects separately.",
  
  "For someone with basic technical knowledge who wants to avoid coding, a website builder is definitely the right choice. These platforms handle all the technical aspects like hosting, security, and mobile responsiveness automatically.\n\nSpecifically for e-commerce with minimal coding:\n\n- Shopify is extremely user-friendly with a dedicated focus on selling products\n- Wix and Squarespace have intuitive drag-and-drop interfaces\n- Square Online is quite simple if you just need basic product listings\n\nThese platforms all offer templates specifically designed for product showcases that you can customize with your own colors, fonts, and branding without writing any code. They also handle inventory management, secure checkout, and shipping calculations automatically.",
  
  "For an affordable, easy-to-setup e-commerce site for handmade goods, I'd recommend Shopify or Square Online.\n\nShopify ($29/month basic plan):\n- Specifically built for e-commerce with all the tools you need\n- Very user-friendly admin interface\n- Excellent for inventory management of multiple products\n- Built-in payment processing with low transaction fees\n- Lots of apps to extend functionality as your business grows\n- Great for businesses expecting to scale up\n\nSquare Online (free to start, then pay-as-you-go):\n- No monthly fee to start (just transaction fees per sale)\n- Very simple to set up quickly\n- Good for smaller inventories\n- Integrates with Square for in-person sales if you do craft fairs\n- More affordable for low-volume sellers\n\nFor a handmade leather goods business just starting online, I'd lean toward Square Online for affordability, unless you have more than 20-30 products or expect high sales volume right away, in which case Shopify would be worth the monthly fee.",
  
  "Great question about SEO! Here are proven strategies to help your handmade leather goods site rank well in search results:\n\n1. Keyword research: Include specific terms people use when searching for leather goods like \"handcrafted leather wallet\" or \"artisan leather bags\" in your product titles, descriptions, and image alt text.\n\n2. Quality content: Create detailed product descriptions that fully explain materials, craftsmanship, and unique features. Consider adding a blog about leather care, your crafting process, or the story behind your products.\n\n3. Local SEO: Set up Google Business Profile if you have a physical workshop or store. Include your city name in product descriptions if you sell locally.\n\n4. Site structure: Both Shopify and Square Online have good built-in SEO features. Make sure to:\n   - Create logical categories for your products\n   - Use SEO-friendly URLs\n   - Have a clear site navigation structure\n   - Ensure your site loads quickly (compress product images)\n\n5. Build backlinks: Get featured on craft blogs, local business directories, or social media accounts focused on handmade goods.\n\nThe good news is that both Shopify and Square Online handle many technical SEO aspects automatically, so you can focus on creating great content and products that naturally attract visitors and links."
];

// Formatted for display in the UI
export const DEFAULT_SAMPLE_TEXT = USER_MESSAGES.map(msg => `User: ${msg}`).join('\n\n');
export const DEFAULT_OUTPUT_TEXT = `Assistant: ${AI_RESPONSES[0]}`;

// Helper function to get the complete conversation
export function getFullConversation() {
  const messages = [];
  
  for (let i = 0; i < USER_MESSAGES.length; i++) {
    messages.push(`User: ${USER_MESSAGES[i]}`);
    if (i < AI_RESPONSES.length) {
      messages.push(`Assistant: ${AI_RESPONSES[i]}`);
    }
  }
  
  return messages.join('\n\n');
}