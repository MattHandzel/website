import { useMemo } from 'react'

interface FinancialData {
  id: string
  month: string
  category: string
  subcategory: string
  amount: number
  type: string
}

interface FinancialDashboardProps {
  financial: FinancialData[]
}

export default function FinancialDashboard({ financial }: FinancialDashboardProps) {
  const summary = useMemo(() => {
    const currentMonth = financial.filter(item => 
      item.month === 'August 2025'
    )
    
    const income = currentMonth
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const expenses = currentMonth
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0)
    
    const savings = currentMonth
      .filter(item => item.type === 'savings')
      .reduce((sum, item) => sum + item.amount, 0)
    
    return { income, expenses, savings, net: income - expenses }
  }, [financial])

  const categoryBreakdown = useMemo(() => {
    const categories: Record<string, number> = {}
    
    financial
      .filter(item => item.month === 'August 2025' && item.type === 'expense')
      .forEach(item => {
        if (!categories[item.category]) {
          categories[item.category] = 0
        }
        categories[item.category] += item.amount
      })
    
    return Object.entries(categories)
      .map(([category, amount]: [string, number]) => ({
        category,
        amount,
        percentage: (amount / summary.expenses) * 100
      }))
      .sort((a: any, b: any) => b.amount - a.amount)
  }, [financial, summary.expenses])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${summary.income.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${summary.expenses.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Savings</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${summary.savings.toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Net Worth Change</h3>
          <p className={`text-2xl font-bold ${summary.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${summary.net.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
        <div className="space-y-3">
          {categoryBreakdown.map(({ category, amount, percentage }) => (
            <div key={category} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{category}</span>
                  <span className="text-sm text-gray-500">
                    ${amount.toLocaleString()} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Rate</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">Monthly Savings Rate</span>
          <span className="text-sm text-gray-500">
            {((summary.savings / summary.income) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-600 h-3 rounded-full" 
            style={{ width: `${(summary.savings / summary.income) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Target: 40% | Current: {((summary.savings / summary.income) * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  )
}
