import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";

const App = () => {
  const [stocks, setStocks] = useState({});
  const [formData, setFormData] = useState({ name: '', price: '', sector: '' });
  const [errors, setErrors] = useState({ name: '', price: '' });
  const [expandedSector, setExpandedSector] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setStocks(prevStocks => {
        let updatedStocks = {...prevStocks};
        Object.keys(updatedStocks).forEach(sector => {
          updatedStocks[sector] = updatedStocks[sector].map(stock => ({
            ...stock,
            percentChange: Math.max(-5, Math.min(5, (Math.random() * 40 - 5) / 4))
          }));
        });
        return updatedStocks;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error on change
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: '', price: '' };

    if (formData.price < 0 || formData.price > 100) {
      newErrors.price = "Price must be between 0 and 100";
      valid = false;
    }

    if (Object.values(stocks).some(sectorStocks => 
        sectorStocks.some(stock => stock.name === formData.name))) {
      newErrors.name = "Stock name already exists";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newStock = {
        name: formData.name,
        price: parseFloat(formData.price).toFixed(2),
        percentChange: 0
      };
      setStocks(prev => ({
        ...prev,
        [formData.sector]: [...(prev[formData.sector] || []), newStock]
      }));
      setFormData({ name: '', price: '', sector: '' });
    }
  };

  const toggleSector = (sector) => {
    setExpandedSector(expandedSector === sector ? null : sector);
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {['name', 'price', 'sector'].map(field => (
            <div key={field} className="flex-1 sm:w-auto">
              <Input 
                name={field} 
                value={formData[field]} 
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className={cn("w-full", errors[field] && "border-red-500")}
              />
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
            </div>
          ))}
          <Button type="submit" disabled={!!Object.values(errors).filter(Boolean).length}>Add Stock</Button>
        </div>
      </form>

      <h2 className="text-xl mb-2">SECTORS</h2>
      {Object.keys(stocks).map(sector => (
        <Card key={sector} className="mb-4">
          <CardHeader onClick={() => toggleSector(sector)} className="cursor-pointer">
            <CardTitle>{sector}</CardTitle>
          </CardHeader>
          {expandedSector === sector && (
            <CardContent>
              <ul>
                {stocks[sector].map((stock, idx) => (
                  <li key={idx} className={cn(
                    "flex justify-between p-2 border-l-4",
                    stock.percentChange < 0 ? 'border-red-500' : 'border-green-500'
                  )}>
                    <span className="min-w-[200px]">{stock.name}</span>
                    <span className="min-w-[250px] text-right">${stock.price}</span>
                    <span className={cn(
                      "min-w-[100px] text-right",
                      stock.percentChange < 0 ? 'text-red-500' : 'text-green-500'
                    )}>
                      {stock.percentChange === 0 ? '0.00%' : `${Math.abs(stock.percentChange).toFixed(2)}%`}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default App;