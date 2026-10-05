import ReactThreeTestRenderer from '@react-three/test-renderer';
import { waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { Mesh, MeshStandardMaterial } from 'three';
import { OrthoticModel } from '../../src/components/OrthoticModel';
import { OrthoticModelProps } from '../../src/types';

// drei's Html labels need a real browser page. Here each label becomes an empty 3D group
// named after its text, so the tests can still check what the labels say.
jest.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: ReactNode }) => <group name={[children].flat().join('')} />,
}));

const props: OrthoticModelProps = {
  lengthMm: 260,
  widthMm: 90.5,
  thicknessMm: 3.5,
  colour: '#3366FF',
  labelContainer: { current: document.createElement('div') },
};

async function renderModel(values: Partial<OrthoticModelProps> = {}) {
  const renderer = await ReactThreeTestRenderer.create(<OrthoticModel {...props} {...values} />);
  const mesh = () => renderer.scene.findByType('Mesh').instance as Mesh;
  return { renderer, mesh };
}

const scaleOf = (mesh: Mesh) => mesh.scale.toArray().map((value) => Number(value.toFixed(3)));

describe('OrthoticModel', () => {
  test('sizes the model from the dimensions', async () => {
    const { mesh } = await renderModel();
    // 1 scene unit = 100 mm: length on x, thickness on y, width on z.
    expect(scaleOf(mesh())).toEqual([2.6, 0.035, 0.905]);
  });

  test('resizes without creating new geometry', async () => {
    const { renderer, mesh } = await renderModel();
    const geometry = mesh().geometry;

    await renderer.update(<OrthoticModel {...props} lengthMm={300} />);

    expect(scaleOf(mesh())[0]).toBe(3);
    expect(mesh().geometry).toBe(geometry);
  });

  test('changes the material colour', async () => {
    const { renderer, mesh } = await renderModel();

    await renderer.update(<OrthoticModel {...props} colour="#AA3366" />);

    expect((mesh().material as MeshStandardMaterial).color.getHexString()).toBe('aa3366');
  });

  test('clamps invalid dimensions', async () => {
    const { mesh } = await renderModel({ lengthMm: 1000, widthMm: Number.NaN, thicknessMm: 0 });
    // Clamped to the allowed range: length max 350, width min 50, thickness min 1.
    expect(scaleOf(mesh())).toEqual([3.5, 0.01, 0.5]);
  });

  test('shows measurement labels and updates them', async () => {
    const { renderer } = await renderModel();
    const labels = () =>
      renderer.scene.findAll((node) => String(node.props.name).endsWith(' mm')).map((label) => label.props.name);
    expect(labels()).toEqual(['260 mm', '90.5 mm', '3.5 mm']);

    await renderer.update(<OrthoticModel {...props} lengthMm={300} />);

    expect(labels()).toEqual(['300 mm', '90.5 mm', '3.5 mm']);
  });

  test('disposes WebGL resources on unmount', async () => {
    const { renderer, mesh } = await renderModel();
    const disposeGeometry = jest.spyOn(mesh().geometry, 'dispose');
    const disposeMaterial = jest.spyOn(mesh().material as MeshStandardMaterial, 'dispose');

    await renderer.unmount();

    // react-three-fiber disposes when the browser is idle, not during unmount, so wait for it.
    await waitFor(() => {
      expect(disposeGeometry).toHaveBeenCalled();
      expect(disposeMaterial).toHaveBeenCalled();
    });
  });
});
