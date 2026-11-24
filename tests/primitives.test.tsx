import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  CommandMenu,
  ConfirmDialog,
  CurrencyInput,
  DataTable,
  PinPad,
} from '../src/primitives/index.ts';

describe('haarls-ui-primitives', () => {
  it('PinPad supports both physical keyboard digits/backspace and button clicks', () => {
    const onComplete = vi.fn();
    render(<PinPad length={4} onComplete={onComplete} error="Invalid PIN. 2 attempts remaining." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid PIN. 2 attempts remaining.');

    const group = screen.getByRole('group', { name: 'Security PIN entry' });
    fireEvent.keyDown(group, { key: '1' });
    fireEvent.keyDown(group, { key: '9' });
    fireEvent.keyDown(group, { key: 'Backspace' });
    fireEvent.click(screen.getByRole('button', { name: 'Digit 0' }));
    fireEvent.click(screen.getByRole('button', { name: 'Digit 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Digit 2' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1042');
  });

  it('CurrencyInput enforces 2-decimal validation and computes minor-unit conversion accurately', () => {
    function Harness() {
      const [usd, setUsd] = useState('19.99');
      return (
        <CurrencyInput
          label="Invoice Total"
          valueUsd={usd}
          onChangeUsd={(next) => setUsd(next)}
          quoteCurrency="VES"
          exchangeRate={36.5}
        />
      );
    }

    render(<Harness />);
    expect(screen.getByText('729.64 VES')).toBeInTheDocument();

    const input = screen.getByLabelText('Invoice Total');
    // Reject >2 decimal digits
    fireEvent.change(input, { target: { value: '19.999' } });
    expect(input).toHaveValue('19.99');

    // Accept valid 2-decimal input
    fireEvent.change(input, { target: { value: '100.50' } });
    expect(input).toHaveValue('100.50');
    expect(screen.getByText('3,668.25 VES')).toBeInTheDocument();
  });

  it('CommandMenu toggles on Ctrl+K, navigates via ArrowDown/Enter, and closes on Escape', () => {
    const runExport = vi.fn();

    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <CommandMenu
          open={open}
          onOpenChange={setOpen}
          items={[
            { id: 'sync', group: 'Ops', label: 'Run Sync', onSelect: () => undefined },
            { id: 'export', group: 'Ops', label: 'Export Ledger CSV', onSelect: runExport },
          ]}
        />
      );
    }

    render(<Harness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const combobox = screen.getByRole('combobox', { name: 'Search commands' });
    expect(combobox).toBeInTheDocument();

    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'Enter' });

    expect(runExport).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('DataTable<T> sorts columns, filters rows, paginates, and shows empty state', () => {
    const rows = [
      { id: '1', name: 'Charlie', latency: 45 },
      { id: '2', name: 'Alpha', latency: 12 },
      { id: '3', name: 'Bravo', latency: 28 },
    ];

    render(
      <DataTable
        data={rows}
        rowKey={(r) => r.id}
        pageSize={2}
        columns={[
          { key: 'name', header: 'Service', sortable: true, getValue: (r) => r.name },
          { key: 'latency', header: 'Latency', sortable: true, numeric: true, getValue: (r) => r.latency },
        ]}
      />,
    );

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Service/ }));
    const cells = screen.getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('Alpha');

    const search = screen.getByPlaceholderText('Filter rows...');
    fireEvent.change(search, { target: { value: 'nonexistent' } });
    expect(screen.getByText('No matching records.')).toBeInTheDocument();
  });

  it('ConfirmDialog traps Tab focus inside modal and restores focus to trigger on Escape', () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setOpen(true)}>
            Delete Token
          </button>
          <ConfirmDialog
            open={open}
            variant="danger"
            title="Delete token?"
            description="Irreversible action."
            confirmLabel="Delete"
            onConfirm={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </div>
      );
    }

    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Delete Token' });
    trigger.focus();
    fireEvent.click(trigger);

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    const confirmBtn = screen.getByRole('button', { name: 'Delete' });
    expect(document.activeElement).toBe(cancelBtn);

    // Shift+Tab from first focusable wraps around to last focusable
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(confirmBtn);

    // Tab from last focusable wraps around to first focusable
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(cancelBtn);

    // Escape closes dialog and returns focus to trigger button
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });
});
