import { Link } from 'react-router-dom'
import { useCart, useCartDispatch } from '../../context/CartContext'

export default function Cart() {
  const { items, isOpen, total } = useCart()
  const dispatch = useCartDispatch()

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
      />

      {/* Cart Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col bg-white transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Cart ({items.length})</h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-medium mb-1 text-gray-800">Your cart is empty</p>
              <p className="text-sm text-gray-500">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.key} className="p-4 rounded-xl bg-white">
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-800">{item.title}</h3>
                      <p className="text-xs text-gray-500">{item.variantTitle}</p>
                    </div>
                    <span className="font-semibold text-sm text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border rounded-lg border-gray-200">
                      <button
                        onClick={() => dispatch({
                          type: 'UPDATE_QUANTITY',
                          payload: { key: item.key, quantity: item.quantity - 1 }
                        })}
                        className="w-8 h-8 flex items-center justify-center text-gray-600"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => dispatch({
                          type: 'UPDATE_QUANTITY',
                          payload: { key: item.key, quantity: item.quantity + 1 }
                        })}
                        className="w-8 h-8 flex items-center justify-center text-gray-600"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.key })}
                      className="text-xs underline text-gray-400 hover:text-gray-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-xl font-semibold text-gray-900">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs mb-4 text-gray-500">Shipping calculated at checkout</p>
            <Link
              to="/checkout"
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="block w-full py-3 text-center text-white font-medium rounded-lg btn-primary"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
