/**
 * Shared cinematic lighting: warm key, cool rim/fill, ambient base,
 * plus two colored accent point lights for depth and glow.
 * (three r155+ uses physical light units — point lights need high intensity.)
 */
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#8fb4d8" />
      {/* key light — warm, like a documentary spotlight */}
      <directionalLight position={[9, 13, 7]} intensity={1.7} color="#fff1dc" />
      {/* cool rim from behind-left for edge separation */}
      <directionalLight position={[-11, -3, -9]} intensity={0.9} color="#38bdf8" />
      {/* violet accent glow from below-front */}
      <pointLight position={[0, -7, 9]} intensity={60} distance={45} color="#a78bfa" />
      {/* cyan accent from upper-left */}
      <pointLight position={[-8, 9, -4]} intensity={40} distance={45} color="#22d3ee" />
    </>
  );
}
