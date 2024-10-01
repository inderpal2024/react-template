import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

function App() {
  const [stocks, setStocks] = useState({});
  const [form, setForm] = useState({ name: '', price: '', sector: '' });
  const [errors, setErrors] = useState({ name: '', price: '' });
  const [expandedSector, setExpandedSector] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => {
        let updatedStocks = { ...prevStocks };
        for (let sector in updatedStocks) {
          updatedStocks[sector] = updatedStocks[sector].map(stock => ({
            ...stock,
            percentageChange: parseFloat(((Math.random() * 40 / 4) - 5).toFixed(2)),
          }));
        }
        return updatedStocks;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = { name: '', price: '' };

    if (form.name && Object.values(stocks).some(sectorStocks => sectorStocks.some(s => s.name === form.name))) {
      newErrors.name = 'Stock name already exists.';
      valid = false;
    }

    if (form.price && (parseFloat(form.price) < 0 || parseFloat(form.price) > 100)) {
      newErrors.price = 'Price must be between 0 and 100.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const newStock = { 
        name: form.name, 
        price: parseFloat(form.price).toFixed(2), 
        percentageChange: 0 
      };
      setStocks(prev => ({
        ...prev,
        [form.sector]: prev[form.sector] ? [...prev[form.sector], newStock] : [newStock]
      }));
      setForm({ name: '', price: '', sector: '' });
    }
  };

  const toggleSector = (sector) => {
    setExpandedSector(expandedSector === sector ? null : sector);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
            <div className="flex-1">
              <Label htmlFor="name">Stock Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                className={cn("mt-1", errors.name && "border-red-500")}
                placeholder="Enter stock name"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="flex-1">
              <Label htmlFor="price">Initial Price</Label>
              <Input 
                id="price" 
                name="price" 
                value={form.price} 
                onChange={handleChange} 
                className={cn("mt-1", errors.price && "border-red-500")}
                placeholder="0.00"
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>
            <div className="flex-1">
              <Label htmlFor="sector">Sector</Label>
              <Input 
                id="sector" 
                name="sector" 
                value={form.sector} 
                onChange={handleChange} 
                className="mt-1"
                placeholder="Enter sector"
              />
            </div>
            <Button type="submit" disabled={!!Object.values(errors).some(Boolean)} className="mt-5 sm:mt-0">Add Stock</Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl mt-8 mb-4">SECTORS</h2>
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
                    "flex items-center justify-between border-l-4 p-2",
                    stock.percentageChange < 0 ? 'border-red-500' : 'border-green-500'
                  )}>
                    <span className="w-[200px]">{stock.name}</span>
                    <span className="w-[250px] text-right">${stock.price}</span>
                    <span className={cn(
                      "w-[100px] text-right",
                      stock.percentageChange < 0 ? 'text-red-500' : 'text-green-500'
                    )}>
                      {stock.percentageChange === 0 ? '0.00%' : `${stock.percentageChange > 0 ? '' : '('}${Math.abs(stock.percentageChange).toFixed(2)}%)`}
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
}

export default App;