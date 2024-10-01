import React, { useState, useEffect } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

const StockForm = ({ onSubmit, error }) => {
  const [stockName, setStockName] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [sector, setSector] = useState('');
  const [priceError, setPriceError] = useState('');
  const [nameError, setNameError] = useState('');

  const validatePrice = (price) => {
    const num = Number(price);
    if (num < 0 || num > 100) {
      setPriceError('Price must be between 0 and 100');
      return false;
    }
    setPriceError('');
    return true;
  };

  const validateName = (name) => {
    if (error.name === name) {
      setNameError('A stock with this name already exists.');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validatePrice(initialPrice) && validateName(stockName)) {
      onSubmit({ stockName, initialPrice: parseFloat(initialPrice), sector });
      setStockName('');
      setInitialPrice('');
      setSector('');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Add Stock</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
          <Input 
            type="text" 
            placeholder="Stock Name" 
            value={stockName} 
            onChange={(e) => { setStockName(e.target.value); validateName(e.target.value); }}
            className={cn("flex-grow", nameError && "border-red-500")}
          />
          <Input 
            type="number" 
            placeholder="Initial Price" 
            value={initialPrice} 
            onChange={(e) => { setInitialPrice(e.target.value); validatePrice(e.target.value); }}
            className={cn("flex-grow", priceError && "border-red-500")}
          />
          <Input 
            type="text" 
            placeholder="Sector" 
            value={sector} 
            onChange={(e) => setSector(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={!!priceError || !!nameError}>Add</Button>
        </form>
        {priceError && <p className="text-red-500 text-xs mt-2">{priceError}</p>}
        {nameError && <p className="text-red-500 text-xs mt-2">{nameError}</p>}
      </CardContent>
    </Card>
  );
};

const StockList = ({ sector, stocks, expanded, onToggle }) => {
  return (
    <div>
      <h3 onClick={onToggle} className="cursor-pointer mb-2 text-lg font-semibold">
        {sector}
      </h3>
      {expanded && (
        <ul className="list-none pl-0">
          {stocks.map((stock, idx) => (
            <li key={idx} className={cn(
              "flex items-center mb-2 p-2 border rounded",
              stock.percentChange < 0 ? 'border-red-500' : 'border-green-500'
            )}>
              <span className="w-52">{stock.name}</span>
              <span className="w-64 text-right">${stock.price.toFixed(2)}</span>
              <span className={cn(
                "w-32 text-right",
                stock.percentChange < 0 ? 'text-red-500' : 'text-green-500'
              )}>
                {stock.percentChange === 0 ? '0.00%' : `(${Math.abs(stock.percentChange).toFixed(2)}%)`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function App() {
  const [stocks, setStocks] = useState({});
  const [error, setError] = useState({ name: '' });
  const [expandedSector, setExpandedSector] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => {
        const updatedStocks = { ...prevStocks };
        for (let sector in updatedStocks) {
          updatedStocks[sector] = updatedStocks[sector].map(stock => ({
            ...stock,
            price: stock.price * (1 + ((Math.floor(Math.random() * 40) + 1) / 4 - 5) / 100),
            percentChange: ((Math.floor(Math.random() * 40) + 1) / 4 - 5)
          }));
        }
        return updatedStocks;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (newStock) => {
    if (Object.values(stocks).flat().some(stock => stock.name === newStock.stockName)) {
      setError({ name: newStock.stockName });
      return;
    }
    setError({ name: '' });
    setStocks(prev => ({
      ...prev,
      [newStock.sector]: [...(prev[newStock.sector] || []), { 
        ...newStock, 
        price: newStock.initialPrice, 
        percentChange: 0 
      }]
    }));
    setExpandedSector(newStock.sector);
  };

  const toggleSector = (sector) => {
    setExpandedSector(expandedSector === sector ? null : sector);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <StockForm onSubmit={handleSubmit} error={error} />
      <h2 className="text-2xl font-bold mb-4">SECTORS</h2>
      {Object.entries(stocks).map(([sector, sectorStocks]) => (
        <StockList 
          key={sector} 
          sector={sector} 
          stocks={sectorStocks} 
          expanded={expandedSector === sector}
          onToggle={() => toggleSector(sector)}
        />
      ))}
    </div>
  );
}