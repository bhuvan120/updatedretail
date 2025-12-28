import React from 'react';
import {
    ShoppingBag,
    Check,
    Plus,
    Tag,
    Layers,
    TrendingUp
} from 'lucide-react';

const ProductCard = ({ product, isAdded, onAdd }) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full group relative overflow-hidden">

            {/* Top Bar showing Status */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="p-5 flex-1 flex flex-col">
                {/* Header: Brand & Status */}
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-sm">
                        {product.product_brand || 'Generic'}
                    </span>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${product.is_product_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${product.is_product_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                        {product.is_product_active ? 'Active' : 'Inactive'}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-800 leading-snug mb-2 line-clamp-2 min-h-[2.5rem]" title={product.product_name}>
                    {product.product_name}
                </h3>

                {/* Metadata Pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                        <Tag size={12} /> {product.product_category}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md">
                        <Layers size={12} /> {product.product_department}
                    </span>
                </div>

                {/* Metrics Spacer */}
                <div className="mt-auto"></div>

                {/* Price & Margin Block */}
                <div className="flex items-end justify-between border-t border-slate-50 pt-4 mb-4">
                    <div>
                        <div className="text-xs text-slate-400 font-medium mb-0.5">Price</div>
                        <div className="text-xl font-bold text-slate-900 tracking-tight">
                            ${product.selling_unit_price.toFixed(2)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400 font-medium mb-0.5 flex items-center justify-end gap-1">
                            Margin <TrendingUp size={10} />
                        </div>
                        <div className={`text-sm font-semibold px-2 py-0.5 rounded-md ${(product.product_margin_percent || 0) > 0.4
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                            }`}>
                            {((product.product_margin_percent || 0) * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        View Details
                    </button>
                    <button
                        onClick={onAdd}
                        disabled={isAdded}
                        className={`col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-sm transform hover:-translate-y-0.5 active:scale-95 ${isAdded
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                            : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200 hover:shadow-md'
                            }`}
                    >
                        {isAdded ? <Check size={14} strokeWidth={3} /> : <ShoppingBag size={14} strokeWidth={2.5} />}
                        {isAdded ? 'Added' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
