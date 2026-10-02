// src/features/market-detail/components/ProductChecklist.tsx - Product checklist items with shortfall recording

import React, { useState } from 'react';
import { OutletProduct } from '@/shared/types';

export interface ProductChecklistProps {
  products: OutletProduct[];
  outletId: string;
  onToggleProduct: (outletId: string, productId: string) => void;
  onUpdateShortfall?: (
    outletId: string,
    productId: string,
    data: { shortQty: number; damagedQty: number; deliveredQty: number; reason?: string }
  ) => void;
}

export const ProductChecklist: React.FC<ProductChecklistProps> = ({
  products,
  outletId,
  onToggleProduct,
  onUpdateShortfall
}) => {
  const [editingProduct, setEditingProduct] = useState<OutletProduct | null>(null);
  const [shortQty, setShortQty] = useState<number>(0);
  const [damagedQty, setDamagedQty] = useState<number>(0);
  const [reason, setReason] = useState<'missing' | 'damaged' | 'other' | string>('missing');
  const [customNote, setCustomNote] = useState<string>('');

  const openShortfallModal = (product: OutletProduct) => {
    setEditingProduct(product);
    const existingShort = Number(product.shortQty || 0);
    const existingDamaged = Number(product.damagedQty || 0);
    setShortQty(existingShort);
    setDamagedQty(existingDamaged);
    if (product.reason) {
      if (['missing', 'damaged', 'other'].includes(product.reason)) {
        setReason(product.reason);
      } else {
        setReason('other');
        setCustomNote(product.reason);
      }
    } else {
      setReason(existingDamaged > 0 && existingShort === 0 ? 'damaged' : 'missing');
      setCustomNote('');
    }
  };

  const closeShortfallModal = () => {
    setEditingProduct(null);
  };

  const expectedTotal = editingProduct ? Number(editingProduct.quantity) : 0;
  const computedDelivered = Math.max(0, expectedTotal - shortQty - damagedQty);
  const isOverQuantity = shortQty + damagedQty > expectedTotal;
  const hasShortfall = shortQty > 0 || damagedQty > 0;
  const isReasonRequired = hasShortfall && !reason;
  const isFormValid = !isOverQuantity && !isReasonRequired;

  const handleSaveShortfall = () => {
    if (!editingProduct || !isFormValid || !onUpdateShortfall) return;
    const finalReason = hasShortfall
      ? reason === 'other' && customNote.trim()
        ? customNote.trim()
        : reason
      : undefined;

    onUpdateShortfall(outletId, editingProduct.id, {
      shortQty,
      damagedQty,
      deliveredQty: computedDelivered,
      reason: finalReason
    });
    closeShortfallModal();
  };

  const handleClearShortfall = () => {
    if (!editingProduct || !onUpdateShortfall) return;
    onUpdateShortfall(outletId, editingProduct.id, {
      shortQty: 0,
      damagedQty: 0,
      deliveredQty: Number(editingProduct.quantity),
      reason: undefined
    });
    closeShortfallModal();
  };

  return (
    <>
      <section aria-label="Unpacking checklist" className="w-full pt-1">
      <div className="bg-surface rounded-[20px] border border-hairline divide-y divide-hairline overflow-hidden shadow-sm">
        {products.map((product) => {
          const isChecked = product.checked;
          const productShort = Number(product.shortQty || 0);
          const productDamaged = Number(product.damagedQty || 0);
          const productHasShortfall = productShort > 0 || productDamaged > 0;
          const expected = Number(product.quantity);
          const delivered = product.deliveredQty !== undefined ? Number(product.deliveredQty) : Math.max(0, expected - productShort - productDamaged);

          return (
            <div
              key={product.id}
              onClick={() => onToggleProduct(outletId, product.id)}
              className="min-h-[56px] px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-bg/40 active:bg-bg/70 transition-colors select-none"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Checkbox Circle (120ms fill) */}
                <div
                  className={`w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 border transition-all duration-[120ms] ${
                    isChecked
                      ? productHasShortfall
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                        : 'bg-action border-action text-white shadow-sm'
                      : 'border-hairline bg-surface'
                  }`}
                >
                  {isChecked && (
                    <span className="material-symbols-outlined text-[18px] leading-none animate-check-draw">
                      check
                    </span>
                  )}
                </div>

                <div className="min-w-0 pr-1">
                  <p
                    className={`text-[17px] font-medium leading-tight truncate transition-colors duration-[120ms] ${
                      isChecked && !productHasShortfall ? 'text-secondary' : 'text-black dark:text-white'
                    }`}
                  >
                    {product.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    {product.chilled && (
                      <span className="text-[12px] text-action font-medium">Chilled storage</span>
                    )}
                    {productHasShortfall && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        <span>
                          {productShort > 0 ? `${productShort} short` : ''}
                          {productShort > 0 && productDamaged > 0 ? ' · ' : ''}
                          {productDamaged > 0 ? `${productDamaged} damaged` : ''}
                          {product.reason ? ` (${product.reason})` : ''}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity and Shortfall action */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span
                    className={`text-[15px] font-mono tabular-nums leading-none ${
                      productHasShortfall
                        ? 'text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-secondary'
                    }`}
                  >
                    {productHasShortfall ? `${delivered} / ${product.quantity}` : product.quantity}{' '}
                    {product.unit}
                  </span>
                </div>

                {onUpdateShortfall && (
                  <button
                    type="button"
                    aria-label={`Report shortfall or damage for ${product.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openShortfallModal(product);
                    }}
                    className="min-w-[48px] min-h-[48px] -mr-2 -my-2 flex items-center justify-center focus:outline-none cursor-pointer"
                    title="Report Short or Damaged Goods"
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        productHasShortfall
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30'
                          : 'text-secondary/70 hover:text-black dark:hover:text-white hover:bg-hairline/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {productHasShortfall ? 'warning' : 'edit_note'}
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>

      {/* Shortfall & Damage Bottom Sheet / Modal */}
      {editingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={closeShortfallModal}
        >
          <div
            className="w-full max-w-md bg-surface border border-hairline rounded-t-[24px] sm:rounded-[24px] p-5 pb-16 sm:pb-6 shadow-2xl space-y-4 animate-sheet-slide max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle for mobile */}
            <div className="w-10 h-1 rounded-full bg-hairline mx-auto -mt-1 mb-1 sm:hidden" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[19px] font-semibold text-black dark:text-white tracking-tight">
                  Record Shortfall or Damage
                </h3>
                <p className="text-[13px] text-secondary mt-0.5 font-normal">
                  {editingProduct.name} · Expected: <span className="font-mono font-medium">{editingProduct.quantity} {editingProduct.unit}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={closeShortfallModal}
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-black dark:hover:text-white hover:bg-hairline/30 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quantity Adjusters */}
            <div className="space-y-3 pt-1">
              {/* Short / Missing */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg/50 border border-hairline">
                <div>
                  <span className="text-[15px] font-medium text-black dark:text-white block">
                    Short / Missing
                  </span>
                  <span className="text-[12px] text-secondary">
                    Items not present in crate
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={shortQty <= 0}
                    onClick={() => setShortQty((q) => Math.max(0, q - 1))}
                    className="w-9 h-9 rounded-lg border border-hairline bg-surface text-secondary hover:text-black dark:hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="w-8 text-center font-mono text-[17px] font-semibold tabular-nums text-black dark:text-white">
                    {shortQty}
                  </span>
                  <button
                    type="button"
                    disabled={shortQty + damagedQty >= expectedTotal}
                    onClick={() => {
                      setShortQty((q) => q + 1);
                      if (!reason) setReason('missing');
                    }}
                    className="w-9 h-9 rounded-lg border border-hairline bg-surface text-secondary hover:text-black dark:hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Damaged */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg/50 border border-hairline">
                <div>
                  <span className="text-[15px] font-medium text-black dark:text-white block">
                    Damaged Goods
                  </span>
                  <span className="text-[12px] text-secondary">
                    Unusable or compromised packaging
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={damagedQty <= 0}
                    onClick={() => setDamagedQty((q) => Math.max(0, q - 1))}
                    className="w-9 h-9 rounded-lg border border-hairline bg-surface text-secondary hover:text-black dark:hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="w-8 text-center font-mono text-[17px] font-semibold tabular-nums text-black dark:text-white">
                    {damagedQty}
                  </span>
                  <button
                    type="button"
                    disabled={shortQty + damagedQty >= expectedTotal}
                    onClick={() => {
                      setDamagedQty((q) => q + 1);
                      if (!reason || reason === 'missing') setReason('damaged');
                    }}
                    className="w-9 h-9 rounded-lg border border-hairline bg-surface text-secondary hover:text-black dark:hover:text-white disabled:opacity-30 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Delivered Accounting Summary */}
              <div className="px-3.5 py-2.5 rounded-xl bg-hairline/20 flex items-center justify-between text-[14px]">
                <span className="text-secondary font-medium">Delivered to store:</span>
                <span className="font-mono font-semibold tabular-nums text-black dark:text-white">
                  {computedDelivered} / {expectedTotal} {editingProduct.unit}
                </span>
              </div>

              {isOverQuantity && (
                <p className="text-[12px] text-red-500 font-medium px-1">
                  Shortfall and damage ({shortQty + damagedQty}) cannot exceed expected total ({expectedTotal}).
                </p>
              )}
            </div>

            {/* Reason Selection (Vocabulary: missing, damaged, other) */}
            {hasShortfall && (
              <div className="space-y-2 pt-1">
                <label className="text-[13px] font-medium text-secondary block">
                  Reason <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['missing', 'damaged', 'other'] as const).map((opt) => {
                    const isSelected = reason === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setReason(opt)}
                        className={`h-10 rounded-xl text-[14px] font-medium capitalize border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-action text-white border-action shadow-sm'
                            : 'bg-surface border-hairline text-secondary hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {reason === 'other' && (
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Specify other reason…"
                    className="w-full h-10 px-3 rounded-xl border border-hairline bg-bg text-[14px] text-black dark:text-white placeholder:text-secondary/60 focus:outline-none focus:ring-1 focus:ring-action"
                  />
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={!isFormValid}
                onClick={handleSaveShortfall}
                className="w-full h-12 rounded-xl bg-action hover:bg-action/90 active:scale-[0.99] text-white font-semibold text-[15px] flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Save
              </button>

              {(Number(editingProduct.shortQty || 0) > 0 || Number(editingProduct.damagedQty || 0) > 0) && (
                <button
                  type="button"
                  onClick={handleClearShortfall}
                  className="w-full h-10 rounded-xl text-secondary hover:text-red-600 text-[14px] font-medium flex items-center justify-center transition-colors cursor-pointer"
                >
                  Clear issue (Full delivery)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
