import React from 'react';

interface BotanicalArtProps {
  variant: 
    | 'hero_wellness'
    | 'weight_kit'
    | 'gummies'
    | 'soap_botanical'
    | 'soap_lavender'
    | 'bundle_ritual'
    | 'daily_supplement'
    | 'philosophy'
    | 'atelier_sanctuary'
    | 'tea_ceremony'
    | 'botanical_press'
    | 'circadian_clock';
  className?: string;
  caption?: string;
}

export const BotanicalArt: React.FC<BotanicalArtProps> = ({ variant, className = '', caption }) => {
  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-[#FAF7F2] select-none ${className}`}>
      {/* Subtle organic travertine/linen texture background */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 25%, #CAD6BC25 0%, #30473B08 60%, transparent 100%)'
        }}
      />

      {/* 1. HERO WELLNESS STILL LIFE */}
      {variant === 'hero_wellness' && (
        <svg viewBox="0 0 800 600" className="w-full h-full object-contain p-6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EFECE5" />
              <stop offset="100%" stopColor="#DDD8CD" />
            </linearGradient>
            <linearGradient id="amberGlass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8C4F2B" />
              <stop offset="35%" stopColor="#B36B3C" />
              <stop offset="70%" stopColor="#6C391B" />
              <stop offset="100%" stopColor="#4A2510" />
            </linearGradient>
            <linearGradient id="forestDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3E5E4E" />
              <stop offset="100%" stopColor="#22342A" />
            </linearGradient>
            <linearGradient id="brassGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6C994" />
              <stop offset="50%" stopColor="#C5A059" />
              <stop offset="100%" stopColor="#8F6E32" />
            </linearGradient>
            <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="16" stdDeviation="16" floodColor="#252A25" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Travertine Stone Plinth */}
          <ellipse cx="400" cy="480" rx="320" ry="60" fill="#252A25" opacity="0.06" />
          <path d="M120 440 C120 400 680 400 680 440 L660 520 C660 550 140 550 140 520 Z" fill="url(#pedestalGrad)" />
          <ellipse cx="400" cy="440" rx="270" ry="40" fill="#E8E3D8" />
          
          {/* Eucalyptus Branch on Left */}
          <g stroke="#3D5A4B" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
            <path d="M160 520 Q220 380 270 240 Q310 120 290 60" />
            <ellipse cx="230" cy="380" rx="28" ry="16" transform="rotate(-30 230 380)" fill="#CAD6BC" stroke="#30473B" strokeWidth="1.5" />
            <ellipse cx="270" cy="310" rx="26" ry="15" transform="rotate(25 270 310)" fill="#CAD6BC" stroke="#30473B" strokeWidth="1.5" />
            <ellipse cx="280" cy="220" rx="24" ry="14" transform="rotate(-15 280 220)" fill="#B5C4A3" stroke="#30473B" strokeWidth="1.5" />
            <ellipse cx="300" cy="140" rx="22" ry="12" transform="rotate(35 300 140)" fill="#CAD6BC" stroke="#30473B" strokeWidth="1.5" />
            <ellipse cx="290" cy="65" rx="16" ry="10" transform="rotate(-10 290 65)" fill="#CAD6BC" stroke="#30473B" strokeWidth="1.5" />
          </g>

          {/* Main Amber Dropper Bottle (Hero Centerpiece) */}
          <g filter="url(#softShadow)">
            <ellipse cx="420" cy="460" rx="60" ry="16" fill="#252A25" opacity="0.2" />
            <rect x="365" y="240" width="110" height="190" rx="24" fill="url(#amberGlass)" />
            <path d="M380 250 L380 415" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
            <path d="M394 255 L394 400" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.2" />

            <rect x="380" y="290" width="80" height="95" rx="4" fill="#FAF7F2" />
            <rect x="388" y="300" width="64" height="2" fill="#30473B" opacity="0.3" />
            <text x="420" y="324" textAnchor="middle" fill="#30473B" fontSize="8" fontFamily="serif" letterSpacing="2" fontWeight="bold">THE WELLNESS HOUSE</text>
            <text x="420" y="342" textAnchor="middle" fill="#71776F" fontSize="6.5" letterSpacing="1">METABOLIC RITUAL</text>
            <circle cx="420" cy="358" r="4" fill="#C58B71" />
            <rect x="400" y="370" width="40" height="1" fill="#71776F" opacity="0.4" />

            <rect x="405" y="210" width="30" height="30" fill="url(#amberGlass)" />
            <rect x="402" y="195" width="36" height="15" rx="2" fill="url(#brassGold)" />
            <path d="M408 195 C408 165 432 165 432 195 Z" fill="#203128" />
          </g>

          {/* Deep Forest Green Matte Jar on the Right */}
          <g filter="url(#softShadow)">
            <ellipse cx="530" cy="465" rx="55" ry="14" fill="#252A25" opacity="0.18" />
            <rect x="480" y="330" width="100" height="110" rx="14" fill="url(#forestDark)" />
            <rect x="475" y="315" width="110" height="20" rx="4" fill="url(#brassGold)" />
            <path d="M480 320 L580 320" stroke="#FFF" strokeWidth="1" opacity="0.3" />
            <rect x="500" y="355" width="60" height="50" rx="2" fill="#FAF7F2" opacity="0.95" />
            <text x="530" y="375" textAnchor="middle" fill="#30473B" fontSize="6.5" fontFamily="serif" fontWeight="bold" letterSpacing="1">HERBAL NECTAR</text>
            <text x="530" y="390" textAnchor="middle" fill="#C58B71" fontSize="5.5">SLEEP & RESTORE</text>
          </g>

          {/* Handcrafted Soap Bar in foreground */}
          <g filter="url(#softShadow)">
            <ellipse cx="320" cy="485" rx="50" ry="12" fill="#252A25" opacity="0.15" />
            <path d="M270 450 L345 425 L385 450 L310 475 Z" fill="#D3DDC7" />
            <path d="M270 450 L310 475 L310 495 L270 470 Z" fill="#B3BEA5" />
            <path d="M310 475 L385 450 L385 470 L310 495 Z" fill="#A0AB92" />
          </g>
        </svg>
      )}

      {/* 2. THE ATELIER SANCTUARY (Architecture, arches, warm linen, stone) */}
      {variant === 'atelier_sanctuary' && (
        <svg viewBox="0 0 800 500" className="w-full h-full object-contain p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wallWash" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F7F3EA" />
              <stop offset="100%" stopColor="#E8E2D5" />
            </linearGradient>
            <linearGradient id="warmSunlight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#E8D5B5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Floor & Architectural Horizon */}
          <rect x="0" y="0" width="800" height="380" fill="url(#wallWash)" />
          <rect x="0" y="380" width="800" height="120" fill="#DED6C7" />
          <line x1="0" y1="380" x2="800" y2="380" stroke="#C8BEAD" strokeWidth="2" />

          {/* Center Grand Arch Portal to Courtyard */}
          <path d="M280 380 L280 160 C280 80 520 80 520 160 L520 380 Z" fill="#E4DCD0" stroke="#D3C7B5" strokeWidth="3" />
          {/* Garden foliage glimpsed outside arch */}
          <path d="M320 380 Q370 240 400 200 Q430 260 480 380" fill="#CAD6BC" opacity="0.6" />
          <ellipse cx="400" cy="220" rx="40" ry="25" fill="#30473B" opacity="0.4" />
          <ellipse cx="360" cy="260" rx="30" ry="20" fill="#3D5A4B" opacity="0.3" />
          <ellipse cx="440" cy="270" rx="35" ry="22" fill="#3D5A4B" opacity="0.3" />

          {/* Sunlight beam entering from arch */}
          <polygon points="280,160 520,160 680,480 120,480" fill="url(#warmSunlight)" />

          {/* Floating Linen Drapery on Left */}
          <path d="M120 40 Q160 220 140 380 L180 380 Q190 200 160 40 Z" fill="#FFFEFA" opacity="0.8" />

          {/* Terracotta Botanical Urn with Olive Branches */}
          <g>
            <ellipse cx="620" cy="410" rx="35" ry="12" fill="#252A25" opacity="0.15" />
            <path d="M595 400 C585 340 590 320 605 310 L635 310 C650 320 655 340 645 400 Z" fill="#C58B71" />
            <ellipse cx="620" cy="310" rx="15" ry="5" fill="#9C6249" />
            {/* Olive stems */}
            <path d="M620 310 Q610 240 580 190" stroke="#30473B" strokeWidth="2" strokeLinecap="round" />
            <path d="M620 310 Q640 220 670 170" stroke="#30473B" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="585" cy="210" rx="12" ry="6" transform="rotate(-30 585 210)" fill="#CAD6BC" />
            <ellipse cx="650" cy="200" rx="14" ry="7" transform="rotate(25 650 200)" fill="#CAD6BC" />
          </g>

          {/* Minimalist Travertine Bench */}
          <rect x="240" y="370" width="160" height="15" rx="2" fill="#FFFEFA" stroke="#D3C7B5" />
          <rect x="255" y="385" width="20" height="25" fill="#E8E2D5" />
          <rect x="365" y="385" width="20" height="25" fill="#E8E2D5" />
          {/* Ceramic bowl on bench */}
          <ellipse cx="320" cy="365" rx="14" ry="6" fill="#DDD5C6" />
        </svg>
      )}

      {/* 3. TEA CEREMONY & HERBAL INFUSION */}
      {variant === 'tea_ceremony' && (
        <svg viewBox="0 0 600 450" className="w-full h-full object-contain p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="300" cy="380" rx="220" ry="35" fill="#252A25" opacity="0.08" />

          {/* Circular Raw Oak Tea Tray */}
          <ellipse cx="300" cy="360" rx="230" ry="50" fill="#DDD2C0" stroke="#C2B49F" strokeWidth="2" />
          <ellipse cx="300" cy="355" rx="220" ry="45" fill="#E8DEC\-D" />

          {/* Ceramic Chawan (Tea Bowl) */}
          <g>
            <ellipse cx="280" cy="320" rx="70" ry="20" fill="#252A25" opacity="0.12" />
            <path d="M210 260 C210 320 350 320 350 260 Z" fill="#FAF6EE" stroke="#C9BFAC" strokeWidth="2" />
            {/* Liquid Infusion Surface */}
            <ellipse cx="280" cy="260" rx="70" ry="18" fill="#A86E45" opacity="0.85" />
            <ellipse cx="280" cy="260" rx="60" ry="15" fill="#C58454" opacity="0.6" />
            {/* Steaming vapor lines */}
            <path d="M260 230 Q270 190 250 160" stroke="#FAF7F2" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            <path d="M290 230 Q305 180 285 140" stroke="#FAF7F2" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
            <path d="M315 235 Q330 195 315 165" stroke="#FAF7F2" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </g>

          {/* Brass Measuring Scoop */}
          <g>
            <path d="M360 360 L440 330" stroke="#C5A059" strokeWidth="4.5" strokeLinecap="round" />
            <ellipse cx="360" cy="360" rx="14" ry="10" fill="#DDBB72" stroke="#8F6E32" />
          </g>

          {/* Loose Botanicals scattered on tray: Fennel seeds, chamomile */}
          <ellipse cx="370" cy="370" rx="2.5" ry="1" fill="#30473B" />
          <ellipse cx="380" cy="368" rx="2.5" ry="1" fill="#30473B" />
          <ellipse cx="390" cy="375" rx="2.5" ry="1" fill="#30473B" />
          <circle cx="410" cy="360" r="4" fill="#E6C994" />
          <circle cx="418" cy="365" r="3.5" fill="#E6C994" />
        </svg>
      )}

      {/* 4. BOTANICAL PRESS & APOTHECARY TOOLS */}
      {variant === 'botanical_press' && (
        <svg viewBox="0 0 600 450" className="w-full h-full object-contain p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="300" cy="380" rx="240" ry="30" fill="#252A25" opacity="0.08" />

          {/* Heavy Stone Mortar and Pestle */}
          <g>
            <ellipse cx="230" cy="350" rx="75" ry="20" fill="#252A25" opacity="0.14" />
            <path d="M160 280 C160 350 300 350 300 280 Z" fill="#D7D0C2" stroke="#ABA191" strokeWidth="2" />
            <ellipse cx="230" cy="280" rx="70" ry="18" fill="#BEB5A5" />
            {/* Ground botanicals inside */}
            <ellipse cx="230" cy="285" rx="55" ry="12" fill="#5A7150" opacity="0.75" />
            {/* Pestle leaning */}
            <rect x="250" y="210" width="22" height="90" rx="10" transform="rotate(25 250 210)" fill="#8A8070" />
          </g>

          {/* Glass Measuring Cylinder with Herbal Tincture */}
          <g>
            <rect x="360" y="190" width="45" height="150" rx="8" fill="#FFFFFF" fillOpacity="0.4" stroke="#CAD6BC" strokeWidth="1.5" />
            {/* Green extract inside cylinder */}
            <rect x="362" y="240" width="41" height="98" rx="6" fill="#3E5E4E" fillOpacity="0.7" />
            {/* Measurement tick marks */}
            <line x1="365" y1="210" x2="375" y2="210" stroke="#71776F" strokeWidth="1" />
            <line x1="365" y1="230" x2="375" y2="230" stroke="#71776F" strokeWidth="1" />
            <line x1="365" y1="250" x2="380" y2="250" stroke="#FAF7F2" strokeWidth="1.5" />
            <line x1="365" y1="270" x2="375" y2="270" stroke="#FAF7F2" strokeWidth="1" />
            <line x1="365" y1="290" x2="380" y2="290" stroke="#FAF7F2" strokeWidth="1.5" />
            <line x1="365" y1="310" x2="375" y2="310" stroke="#FAF7F2" strokeWidth="1" />
          </g>

          {/* Fresh sprigs of Mint and Eucalyptus */}
          <path d="M420 370 Q460 320 480 260" stroke="#30473B" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="445" cy="320" rx="16" ry="8" transform="rotate(-30 445 320)" fill="#CAD6BC" />
          <ellipse cx="465" cy="285" rx="14" ry="7" transform="rotate(20 465 285)" fill="#CAD6BC" />
        </svg>
      )}

      {/* 5. CIRCADIAN CLOCK (Celestial Sun & Moon Rhythms) */}
      {variant === 'circadian_clock' && (
        <svg viewBox="0 0 600 450" className="w-full h-full object-contain p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="300" cy="225" r="160" fill="#FAF6EE" stroke="#30473B" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Day hemisphere (Sunrise / Metabolism) */}
          <path d="M300 65 A160 160 0 0 1 300 385 Z" fill="#F4EFE6" />
          
          {/* Sun icon on Day side */}
          <circle cx="370" cy="180" r="24" fill="#C5A059" />
          <g stroke="#C5A059" strokeWidth="2" strokeLinecap="round">
            <line x1="370" y1="145" x2="370" y2="138" />
            <line x1="370" y1="215" x2="370" y2="222" />
            <line x1="335" y1="180" x2="328" y2="180" />
            <line x1="405" y1="180" x2="412" y2="180" />
          </g>
          <text x="370" y="245" textAnchor="middle" fill="#30473B" fontSize="9" fontFamily="serif" letterSpacing="1">07:00 METABOLIC PEAK</text>

          {/* Moon icon on Night side */}
          <path d="M230 165 C220 185 220 215 240 230 C225 225 210 205 215 180 C218 172 223 167 230 165 Z" fill="#30473B" />
          <text x="230" y="260" textAnchor="middle" fill="#71776F" fontSize="9" fontFamily="serif" letterSpacing="1">22:00 PARASYMPATHETIC</text>

          {/* Central Compass Needle */}
          <circle cx="300" cy="225" r="8" fill="#30473B" />
          <polygon points="300,100 295,225 305,225" fill="#30473B" />
          <polygon points="300,350 295,225 305,225" fill="#C58B71" />
        </svg>
      )}

      {/* 6. WEIGHT KIT / METABOLIC BALANCE */}
      {variant === 'weight_kit' && (
        <svg viewBox="0 0 500 400" className="w-full h-full object-contain p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="250" cy="340" rx="190" ry="25" fill="#252A25" opacity="0.12" />
          <path d="M90 280 L350 210 L440 260 L180 330 Z" fill="#E8E3D7" stroke="#30473B" strokeWidth="1" strokeOpacity="0.2" />
          <path d="M90 280 L180 330 L180 345 L90 295 Z" fill="#D7D1C3" />
          <path d="M180 330 L440 260 L440 275 L180 345 Z" fill="#C2BBAA" />

          {/* Metabolic Balance Jar */}
          <g>
            <rect x="180" y="150" width="80" height="130" rx="16" fill="#203128" />
            <rect x="175" y="135" width="90" height="18" rx="4" fill="#C5A059" />
            <rect x="190" y="180" width="60" height="70" rx="2" fill="#FFFEFA" />
            <text x="220" y="202" textAnchor="middle" fill="#30473B" fontSize="6.5" fontFamily="serif" fontWeight="bold">METABOLIC</text>
            <text x="220" y="215" textAnchor="middle" fill="#71776F" fontSize="5.5">HERBAL TABLETS</text>
            <text x="220" y="235" textAnchor="middle" fill="#C58B71" fontSize="7" fontWeight="bold">STANDARDIZED</text>
          </g>

          {/* Digestive Infusion Tin */}
          <g>
            <rect x="280" y="170" width="75" height="110" rx="10" fill="#CAD6BC" stroke="#30473B" strokeWidth="1" strokeOpacity="0.4" />
            <rect x="277" y="158" width="81" height="15" rx="3" fill="#203128" />
            <rect x="290" y="195" width="55" height="60" rx="2" fill="#FFFEFA" />
            <text x="317" y="218" textAnchor="middle" fill="#30473B" fontSize="6" fontFamily="serif" fontWeight="bold">DIGESTIVE</text>
            <text x="317" y="230" textAnchor="middle" fill="#71776F" fontSize="5">INFUSION TEA</text>
          </g>

          {/* Brass Scoop */}
          <path d="M140 310 L220 270" stroke="#C5A059" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="140" cy="310" rx="14" ry="9" fill="#C5A059" />
        </svg>
      )}

      {/* 7. SLEEP GUMMIES */}
      {variant === 'gummies' && (
        <svg viewBox="0 0 500 400" className="w-full h-full object-contain p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="250" cy="340" rx="95" ry="20" fill="#252A25" opacity="0.12" />
          {/* Glass Jar Body */}
          <rect x="180" y="140" width="140" height="180" rx="24" fill="#FFFFFF" fillOpacity="0.5" stroke="#30473B" strokeWidth="1.5" strokeOpacity="0.25" />
          {/* Jar Lid in Forest Green */}
          <rect x="175" y="120" width="150" height="24" rx="6" fill="#30473B" />
          {/* Gummies inside */}
          <circle cx="225" cy="285" r="14" fill="#6E3555" opacity="0.9" />
          <circle cx="260" cy="290" r="14" fill="#6E3555" opacity="0.95" />
          <circle cx="240" cy="265" r="14" fill="#C5673E" opacity="0.9" />
          <circle cx="275" cy="270" r="14" fill="#6E3555" opacity="0.85" />
          <circle cx="250" cy="235" r="14" fill="#C5673E" opacity="0.95" />
          {/* Label */}
          <rect x="195" y="180" width="110" height="80" rx="4" fill="#FFFEFA" />
          <text x="250" y="206" textAnchor="middle" fill="#30473B" fontSize="8" fontFamily="serif" fontWeight="bold">SLEEP & RESTORE</text>
          <text x="250" y="222" textAnchor="middle" fill="#71776F" fontSize="6.5">APPLE PECTIN NECTAR</text>
          <text x="250" y="246" textAnchor="middle" fill="#C58B71" fontSize="6" fontWeight="bold">100% VEGAN</text>
        </svg>
      )}

      {/* 8. BOTANICAL SOAP BAR */}
      {variant === 'soap_botanical' && (
        <svg viewBox="0 0 500 400" className="w-full h-full object-contain p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="250" cy="330" rx="140" ry="25" fill="#252A25" opacity="0.1" />
          <ellipse cx="250" cy="320" rx="150" ry="40" fill="#FFFEFA" stroke="#E8E3D7" strokeWidth="2" />
          <path d="M170 230 L290 190 L360 230 L240 270 Z" fill="#CAD6BC" />
          <path d="M170 230 L240 270 L240 310 L170 270 Z" fill="#8F9F7E" />
          <path d="M240 270 L360 230 L360 270 L240 310 Z" fill="#7A896B" />
          <ellipse cx="265" cy="230" rx="25" ry="12" fill="none" stroke="#6F7C61" strokeWidth="1.5" strokeDasharray="2 1" />
          <text x="265" y="233" textAnchor="middle" fill="#4B5641" fontSize="5.5" fontFamily="serif" fontWeight="bold">COLD-PROCESS</text>
        </svg>
      )}

      {/* 9. LAVENDER SOAP */}
      {variant === 'soap_lavender' && (
        <svg viewBox="0 0 500 400" className="w-full h-full object-contain p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="250" cy="330" rx="140" ry="22" fill="#252A25" opacity="0.1" />
          <path d="M160 220 L280 180 L350 220 L230 260 Z" fill="#C8B8C7" />
          <path d="M160 220 L230 260 L230 300 L160 260 Z" fill="#A894A7" />
          <path d="M230 260 L350 220 L350 260 L230 300 Z" fill="#8F788E" />
          <ellipse cx="255" cy="220" rx="24" ry="12" fill="none" stroke="#7A6579" strokeWidth="1.5" />
          <text x="255" y="223" textAnchor="middle" fill="#5F4A5E" fontSize="5.5" fontFamily="serif" fontWeight="bold">KASHMIR</text>
        </svg>
      )}

      {/* 10. BUNDLE RITUAL */}
      {variant === 'bundle_ritual' && (
        <svg viewBox="0 0 500 400" className="w-full h-full object-contain p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="250" cy="340" rx="180" ry="24" fill="#252A25" opacity="0.1" />
          <rect x="100" y="160" width="300" height="150" rx="12" fill="#F4EFE6" stroke="#D3CABE" strokeWidth="1.5" />
          <rect x="240" y="160" width="20" height="150" fill="#30473B" />
          <rect x="100" y="225" width="300" height="18" fill="#30473B" />
          <rect x="220" y="205" width="60" height="60" rx="6" fill="#FFFEFA" stroke="#30473B" strokeWidth="1" />
          <text x="250" y="232" textAnchor="middle" fill="#30473B" fontSize="7" fontFamily="serif" fontWeight="bold">SIGNATURE</text>
          <text x="250" y="244" textAnchor="middle" fill="#C58B71" fontSize="6">RITUAL SUITE</text>
        </svg>
      )}

      {/* 11. DAILY SUPPLEMENT */}
      {variant === 'daily_supplement' && (
        <svg viewBox="0 0 500 400" className="w-full h-full object-contain p-4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="250" cy="335" rx="85" ry="18" fill="#252A25" opacity="0.12" />
          <rect x="190" y="150" width="120" height="170" rx="20" fill="#8C4F2B" />
          <rect x="185" y="130" width="130" height="24" rx="4" fill="#203128" />
          <rect x="205" y="190" width="90" height="90" rx="2" fill="#FFFEFA" />
          <text x="250" y="218" textAnchor="middle" fill="#30473B" fontSize="7" fontFamily="serif" fontWeight="bold">KSM-66®</text>
          <text x="250" y="232" textAnchor="middle" fill="#71776F" fontSize="6">ASHWAGANDHA</text>
          <text x="250" y="258" textAnchor="middle" fill="#C58B71" fontSize="6" fontWeight="bold">ROOT BIO-ACTIVE</text>
        </svg>
      )}

      {/* 12. PHILOSOPHY STILL LIFE */}
      {variant === 'philosophy' && (
        <svg viewBox="0 0 600 400" className="w-full h-full object-contain p-6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="300" cy="320" rx="240" ry="30" fill="#252A25" opacity="0.08" />
          <path d="M180 280 C180 230 250 230 250 280 Z" fill="#E8E3D7" stroke="#30473B" strokeWidth="1" />
          <path d="M280 280 Q320 180 340 160" stroke="#30473B" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="310" cy="220" rx="20" ry="10" transform="rotate(-30 310 220)" fill="#CAD6BC" />
          <ellipse cx="330" cy="180" rx="16" ry="8" transform="rotate(20 330 180)" fill="#CAD6BC" />
          <text x="300" y="360" textAnchor="middle" fill="#71776F" fontSize="10" letterSpacing="4">CONSCIOUS COMPOUNDING</text>
        </svg>
      )}

      {caption && (
        <div className="absolute bottom-3 left-4 text-[10px] font-mono tracking-widest uppercase text-[#71776F]/80 bg-[#FFFEFA]/80 px-2 py-0.5 rounded-xs">
          {caption}
        </div>
      )}
    </div>
  );
};
