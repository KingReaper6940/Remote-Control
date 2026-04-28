import { Effects } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Particles } from "./particles";
import { VignetteShader } from "./shaders/vignetteShader";

export const GL = ({ hovering }: { hovering: boolean }) => {
  // Hardcoded production values
  const speed = 1.0;
  const focus = 3.8;
  const aperture = 1.79;
  const size = 512;
  const noiseScale = 0.6;
  const noiseIntensity = 0.52;
  const timeScale = 1.0;
  const pointSize = 10.0;
  const opacity = 0.8;
  const planeScale = 10.0;
  const vignetteDarkness = 0.5;
  const vignetteOffset = 1.0;
  const useManualTime = false;
  const manualTime = 0;

  return (
    <div id="webgl" className="absolute inset-0 z-0">
      <Canvas
        camera={{
          position: [
            1.2629783123314589, 2.664606471394044, -1.8178993743288914,
          ],
          fov: 50,
          near: 0.01,
          far: 300,
        }}
      >
        <color attach="background" args={["#000"]} />
        <Particles
          speed={speed}
          aperture={aperture}
          focus={focus}
          size={size}
          noiseScale={noiseScale}
          noiseIntensity={noiseIntensity}
          timeScale={timeScale}
          pointSize={pointSize}
          opacity={opacity}
          planeScale={planeScale}
          useManualTime={useManualTime}
          manualTime={manualTime}
          introspect={hovering}
        />
        <Effects multisamping={0} disableGamma>
          <shaderPass
            args={[VignetteShader]}
            uniforms-darkness-value={vignetteDarkness}
            uniforms-offset-value={vignetteOffset}
          />
        </Effects>
      </Canvas>
    </div>
  );
};
