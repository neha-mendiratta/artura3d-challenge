import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderForm } from '../../src/components/OrderForm';
import { NEW_ORDER_DEFAULTS } from '../../src/constants';
import { renderComponent } from '../helpers/render';

const values = { ...NEW_ORDER_DEFAULTS, patientRef: 'PT-1042' };

describe('OrderForm', () => {
  test('saves valid values', async () => {
    const onSave = jest.fn();
    renderComponent(<OrderForm initialValues={values} locked={false} saving={false} onSave={onSave} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith({ ...values, notes: '' }, expect.anything());
  });

  test('shows a validation error', async () => {
    const onSave = jest.fn();
    renderComponent(<OrderForm initialValues={values} locked={false} saving={false} onSave={onSave} />);

    const width = screen.getByLabelText('Width (mm)');
    await userEvent.clear(width);
    await userEvent.type(width, '200');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Width must be between 50 and 150 mm')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  test('disables editing when submitted', () => {
    renderComponent(<OrderForm initialValues={values} locked saving={false} onSave={jest.fn()} />);

    expect(screen.getByLabelText('Patient ref')).toBeDisabled();
    expect(screen.getByLabelText('Width (mm)')).toBeDisabled();
    expect(screen.getByLabelText('Expedite (+15%)')).toBeDisabled();
    expect(screen.getByLabelText('Notes')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save notes' })).toBeInTheDocument();
  });

  test('disables the button while saving', () => {
    renderComponent(<OrderForm initialValues={values} locked={false} saving onSave={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
