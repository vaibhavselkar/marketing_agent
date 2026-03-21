/**
 * Business configuration loaded from environment variables.
 * Each client you onboard sets these in their Vercel project settings.
 */
const config = {
  name:            process.env.BUSINESS_NAME            || 'Your Business',
  tagline:         process.env.BUSINESS_TAGLINE         || 'Quality products and services',
  website:         process.env.BUSINESS_WEBSITE         || '#',
  instagram:       process.env.BUSINESS_INSTAGRAM       || '',
  productType:     process.env.BUSINESS_PRODUCT_TYPE    || 'products',
  discountCode:    process.env.BUSINESS_DISCOUNT_CODE   || '',
  discountPercent: process.env.BUSINESS_DISCOUNT_PERCENT || '10',
  currency:        process.env.BUSINESS_CURRENCY        || '₹',
  country:         process.env.BUSINESS_COUNTRY         || 'India',
};

export default config;
