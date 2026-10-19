export function contentSecurityPolicy(nonce: string, dev: boolean) {
  return (
    "default-src 'self'; script-src 'self' " +
    (dev
      ? "'unsafe-inline' 'unsafe-eval'"
      : `'nonce-${nonce}' 'strict-dynamic'`) +
    " https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://images.unsplash.com https://picsum.photos data: blob:; media-src 'self' https://assets.mixkit.co https://videos.pexels.com blob:; font-src 'self' data:; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com" +
    (dev ? " ws:" : "") +
    "; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'"
  );
}
