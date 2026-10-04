# 3D preview

Status: Approved

## Source

- Render a 3D object representing an orthotic (can be a simple rectangular prism)
- Dimension controls allow a live update of the model
- Colour selection changes the material colour on the orthotic
- Basic orbit camera controls
- Proper cleanup of WebGL resources
- Something additional that isn't in the spec and adds value for the user

## Behaviour

One component, `OrthoticPreview`, in `apps/web`, built with react-three-fiber (React for Three.js) and drei (ready-made helpers). It is shown next to the order form (spec 06) and receives `lengthMm`, `widthMm`, `thicknessMm` and `colour` from the form.

- **Model:** a rectangular prism (box). Length, thickness and width map to the box's x, y and z size.
- **Live dimensions:** the form's dimension fields are the controls. Every change resizes the box immediately.
  - The box geometry is created once at size 1 and resized by setting the mesh's `scale`, so typing does not create new geometry each time.
  - An empty or out-of-range value (while typing) is clamped to the allowed range, so the model never breaks.
- **Colour:** the form's colour picker sets the material colour.
- **Orbit controls:** drei `OrbitControls`: drag to rotate, scroll to zoom (with min and max distance), right-drag to pan.
- **Submitted orders:** the form is disabled but the preview can still be rotated and zoomed.

### WebGL cleanup

- react-three-fiber disposes geometries and materials it created when the component unmounts, and releases the WebGL context when the `<Canvas>` unmounts (e.g. navigating back to the orders list).
- Because resizing uses `scale`, no geometry is replaced while editing, so nothing is left behind.

### Extra feature: measurement labels

Each edge of the box shows its size in millimetres (e.g. `260 mm`, `90.5 mm`, `3.5 mm`), using drei `Html` labels. They update live with the form.

Value for the user: an operations manager can check at a glance that the model matches the prescription, without reading the numbers off the form.

### Tests

Jest with `@react-three/test-renderer`, which renders the scene without a browser or graphics card.

## Edge cases

| Situation | Expected | Test |
|---|---|---|
| Dimensions given | Box scale matches length, thickness, width | `sizes the model from the dimensions` |
| Dimension changes | Scale updates, same geometry object | `resizes without creating new geometry` |
| Colour changes | Material colour updates | `changes the material colour` |
| Empty or out-of-range dimension | Clamped to the allowed range | `clamps invalid dimensions` |
| Labels | Show each dimension in mm and update | `shows measurement labels` |
| Component unmounts | Geometry and material `dispose()` called | `disposes WebGL resources on unmount` |

## Acceptance criteria

1. The preview meets every point in Source.
2. Every edge case above has a passing test.

## Out of scope

- A realistic foot-shaped model: the brief accepts a rectangular prism; the box keeps the code simple.
- Textures, lighting presets, exporting the model: not in the brief.
