// App.jsx
import React, { useState, useEffect } from 'react';
import { Button, Input, Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

function App() {
  const [stocks, setStocks] = useState({});
  const [formData, setFormData] = useState({ name: '', price: '', sector: '' });
  const [errors, setErrors] = useState({ name: '', price: '' });
  const [expandedSector, setExpandedSector] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error on change
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (formData.price < 0 || formData.price > 100) {
      newErrors.price = 'Price must be between 0 and 100.';
      valid = false;
    }

    if (Object.keys(stocks).some(sector => 
      Object.keys(stocks[sector]).includes(formData.name)
    )) {
      newErrors.name = 'Stock name must be unique.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newStock = { 
        price: parseFloat(formData.price), 
        change: 0 
      };
      setStocks(prev => ({
        ...prev,
        [formData.sector]: {
          ...(prev[formData.sector] || {}),
          [formData.name]: newStock
        }
      }));
      setFormData({ name: '', price: '', sector: '' });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setStocks(prevStocks => {
        let updatedStocks = { ...prevStocks };
        for (let sector in updatedStocks) {
          for (let stock in updatedStocks[sector]) {
            const randomChange = ((Math.floor(Math.random() * 40) + 1) / 4) - 5;
            const newPrice = updatedStocks[sector][stock].price * (1 + randomChange / 100);
            updatedStocks[sector][stock] = {
              ...updatedStocks[sector][stock],
              price: newPrice,
              change: ((newPrice - updatedStocks[sector][stock].price) / updatedStocks[sector][stock].price) * 100
            };
          }
        }
        return updatedStocks;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-wrap -mx-2">
          {['name', 'price', 'sector'].map(field => (
            <div key={field} className="w-full px-2 mb-2 md:w-1/3">
              <Input 
                name={field}
                value={formData[field]} 
                onChange={handleInputChange} 
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className={cn("w-full", {"border-red-500": errors[field]})}
              />
              {errors[field] && <p className="text-sm text-red-500 mt-1">{errors[field]}</p>}
            </div>
          ))}
        </div>
        <Button type="submit" disabled={Object.values(errors).some(Boolean)}>Add Stock</Button>
      </form>

      <h2 className="text-2xl font-bold mb-4">SECTORS</h2>
      {Object.keys(stocks).map(sector => (
        <div key={sector} className="mb-4">
          <Card 
            onClick={() => setExpandedSector(expandedSector === sector ? null : sector)}
            className="cursor-pointer"
          >
            <CardContent>
              <h3>{sector}</h3>
            </CardContent>
          </Card>
          {(expandedSector === sector) && (
            <ul className="list-none pl-0">
              {Object.keys(stocks[sector]).map(stockName => (
                <li key={stockName} className={cn(
                  "flex items-center border-l-4 p-2",
                  stocks[sector][stockName].change < 0 ? 'border-red-500' : 'border-green-500'
                )}>
                  <span className="w-52 truncate">{stockName}</span>
                  <span className="w-64 text-right">${stocks[sector][stockName].price.toFixed(2)}</span>
                  <span className={cn(
                    "w-32 text-right",
                    stocks[sector][stockName].change < 0 ? 'text-red-500' : 'text-green-500'
                  )}>
                    {stocks[sector][stockName].change.toFixed(2)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;