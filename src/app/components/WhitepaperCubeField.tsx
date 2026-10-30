import { useEffect, useRef } from "react"
import { animate } from "animejs/animation"
import { getInstances } from "animejs/adapters/three"
import "animejs/adapters/three"
import { createTimer } from "animejs/timer"
import { stagger } from "animejs/utils"
import { useReducedMotion } from "motion/react"
import * as THREE from "three"

const GRID_SIZE = 4
const INSTANCE_COUNT = GRID_SIZE ** 3
type CubeInstance = NonNullable<ReturnType<typeof getInstances>[number]>

export function WhitepaperCubeField() {
  const containerRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.z = 6
    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.className = "h-full w-full"
    renderer.domElement.setAttribute("aria-hidden", "true")
    container.appendChild(renderer.domElement)

    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim()
    const lavender = new THREE.Color(accent || "#DCC2FE")
    const isMobile = window.innerWidth < 768
    const layout = isMobile
      ? { originX: 0, originY: 0.35, expansion: 5, scale: 0.5 }
      : { originX: 2.15, originY: 0.65, expansion: 10, scale: 1 }

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(lavender, 16, 24, 0.35)
    pointLight.position.set(layout.originX, layout.originY, 3)
    pointLight.castShadow = true
    scene.add(pointLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2)
    directionalLight.position.set(2, 3, 4)
    scene.add(directionalLight)

    const cellSize = 2 / GRID_SIZE
    const spread = ((GRID_SIZE - 1) / 2) * cellSize
    const geometry = new THREE.BoxGeometry(
      cellSize * 0.82,
      cellSize * 0.82,
      cellSize * 0.82,
    )
    const material = new THREE.MeshLambertMaterial({
      color: lavender,
      transparent: true,
      opacity: 0.82,
    })
    const mesh = new THREE.InstancedMesh(geometry, material, INSTANCE_COUNT)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.position.set(layout.originX, layout.originY, 0)
    mesh.scale.setScalar(layout.scale)
    scene.add(mesh)

    const instances = getInstances(mesh).filter((instance) => instance !== null)

    instances.forEach((instance, index) => {
      const x = index % GRID_SIZE
      const y = Math.floor(index / GRID_SIZE) % GRID_SIZE
      const z = Math.floor(index / (GRID_SIZE * GRID_SIZE))
      instance.x = -spread + x * cellSize
      instance.y = -spread + y * cellSize
      instance.z = -spread + z * cellSize
    })

    const animations = shouldReduceMotion
      ? []
      : [
          animate(mesh, {
            rotateY: { to: 360, duration: 9000 },
            rotateX: { to: 360, duration: 12000 },
            loop: true,
            ease: "inOutQuad",
          }),
          animate(pointLight, {
            intensity: [24, 5],
            duration: 2500,
            loop: true,
            loopDelay: 500,
            alternate: true,
            ease: "out(3)",
          }),
          animate(instances, {
            x: (instance: unknown) =>
              (instance as CubeInstance).x * layout.expansion,
            y: (instance: unknown) =>
              (instance as CubeInstance).y * layout.expansion,
            z: (instance: unknown) =>
              (instance as CubeInstance).z * layout.expansion,
            duration: 2000,
            delay: stagger([0, 500], {
              grid: true,
              from: "center",
              reversed: true,
              ease: "in(3)",
            }),
            loop: true,
            loopDelay: 500,
            alternate: true,
            ease: "inOutExpo",
          }),
        ]

    const renderTimer = shouldReduceMotion
      ? null
      : createTimer({
          onUpdate: () => renderer.render(scene, camera),
        })

    const resize = () => {
      const { clientWidth, clientHeight } = container
      camera.aspect = clientWidth / Math.max(clientHeight, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight, false)
      renderer.render(scene, camera)
    }

    const handleVisibility = () => {
      if (document.hidden) {
        animations.forEach((animation) => animation.pause())
        renderTimer?.pause()
      } else {
        animations.forEach((animation) => animation.resume())
        renderTimer?.resume()
      }
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    document.addEventListener("visibilitychange", handleVisibility)
    resize()

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      resizeObserver.disconnect()
      animations.forEach((animation) => animation.cancel())
      renderTimer?.cancel()
      scene.remove(mesh, ambientLight, pointLight, directionalLight)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [shouldReduceMotion])

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    >
      <div
        ref={containerRef}
        className="sticky top-20 h-[calc(100svh-5rem)] w-full"
      />
    </div>
  )
}
