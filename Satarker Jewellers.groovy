import React, { useState, useRef } from 'react';
import { Calculator, FileText, Receipt, Download, Printer, Menu, X } from 'lucide-react';

const SatarkarJewellers = () => {
  const [activeTab, setActiveTab] = useState('billing');
  const [menuOpen, setMenuOpen] = useState(false);
  const printRef = useRef();

  // Billing State
  const [billing, setBilling] = useState({
    customerName: '',
    phone: '',
    itemName: 'Gold',
    weight: '',
    rate: '',
    makingCharges: '',
    gstEnabled: false
  });

  // Pawn State
  const [pawn, setPawn] = useState({
    customerName: '',
    phone: '',
    weight: '',
    rate: '',
    loanPercentage: '75',
    interestRate: '1.5',
    duration: '12'
  });

  // Invoice State
  const [invoice, setInvoice] = useState(null);
  const [pawnResult, setPawnResult] = useState(null);

  // Backend URL - Update this with your deployed backend URL
  const BACKEND_URL = 'http://localhost:5000'; // Change to your deployed URL

  // Calculate Billing Total
  const calculateTotal = () => {
    const weight = parseFloat(billing.weight) || 0;
    const rate = parseFloat(billing.rate) || 0;
    const making = parseFloat(billing.makingCharges) || 0;
    
    const itemTotal = weight * rate;
    const subtotal = itemTotal + making;
    const gst = billing.gstEnabled ? subtotal * 0.03 : 0;
    const total = subtotal + gst;

    return { itemTotal, subtotal, gst, total };
  };

  // Generate Bill and Save to Excel
  const generateBill = async () => {
    if (!billing.customerName || !billing.phone || !billing.weight || !billing.rate) {
      alert('कृपया सर्व आवश्यक फील्ड भरा / Please fill all required fields');
      return;
    }

    const totals = calculateTotal();
    const billNo = `SAT${Date.now().toString().slice(-6)}`;
    
    const invoiceData = {
      billNo,
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      customerName: billing.customerName,
      phone: billing.phone,
      itemName: billing.itemName,
      weight: parseFloat(billing.weight),
      rate: parseFloat(billing.rate),
      makingCharges: parseFloat(billing.makingCharges) || 0,
      gstEnabled: billing.gstEnabled,
      itemTotal: totals.itemTotal,
      subtotal: totals.subtotal,
      gst: totals.gst,
      total: totals.total
    };

    setInvoice(invoiceData);

    // Save to backend Excel
    try {
      const response = await fetch(`${BACKEND_URL}/api/bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert('✅ बिल Excel फाईलमध्ये सेव्ह झाले / Bill saved to Excel successfully!');
        console.log('Saved to:', result.file);
      } else {
        alert('⚠️ Excel सेव्ह करताना त्रुटी / Error saving to Excel: ' + result.error);
      }
    } catch (error) {
      alert('⚠️ Backend शी कनेक्ट होऊ शकत नाही. बिल तयार झाले पण Excel मध्ये सेव्ह झाले नाही.\n\nBackend not connected. Bill generated but not saved to Excel.');
      console.error('Backend error:', error);
    }
  };

  // Calculate Pawn and Save to Excel
  const calculatePawn = async () => {
    if (!pawn.customerName || !pawn.phone || !pawn.weight || !pawn.rate) {
      alert('कृपया सर्व फील्ड भरा / Please fill all fields');
      return;
    }

    const weight = parseFloat(pawn.weight);
    const rate = parseFloat(pawn.rate);
    const loanPct = parseFloat(pawn.loanPercentage) / 100;
    const interestRate = parseFloat(pawn.interestRate) / 100;
    const duration = parseInt(pawn.duration);

    const goldValue = weight * rate;
    const loanAmount = goldValue * loanPct;
    const monthlyInterest = loanAmount * interestRate;
    const totalInterest = monthlyInterest * duration;
    const totalPayable = loanAmount + totalInterest;

    const result = {
      customerName: pawn.customerName,
      phone: pawn.phone,
      weight: weight,
      rate: rate,
      goldValue: goldValue.toFixed(2),
      loanPercentage: pawn.loanPercentage,
      loanAmount: loanAmount.toFixed(2),
      interestRate: pawn.interestRate,
      duration: duration,
      monthlyInterest: monthlyInterest.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPayable: totalPayable.toFixed(2),
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setPawnResult(result);

    // Save to backend Excel
    try {
      const response = await fetch(`${BACKEND_URL}/api/pawn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        alert('✅ पावती Excel फाईलमध्ये सेव्ह झाली / Pawn record saved to Excel successfully!');
        console.log('Saved to:', responseData.file);
      } else {
        alert('⚠️ Excel सेव्ह करताना त्रुटी / Error saving to Excel: ' + responseData.error);
      }
    } catch (error) {
      alert('⚠️ Backend शी कनेक्ट होऊ शकत नाही. गणना पूर्ण झाली पण Excel मध्ये सेव्ह झाले नाही.\n\nBackend not connected. Calculation done but not saved to Excel.');
      console.error('Backend error:', error);
    }
  };

  // Print Invoice
  const handlePrint = () => {
    window.print();
  };

  // Download Excel Files
  const downloadExcel = async (type) => {
    try {
      const month = new Date().toISOString().slice(0, 7).replace('-', '_');
      const filename = `${type}_${month}.xlsx`;
      
      window.open(`${BACKEND_URL}/api/download/${type}/${filename}`, '_blank');
    } catch (error) {
      alert('Download failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">सातरकर ज्वेलर्स</h1>
                <p className="text-sm text-amber-100">Satarkar Jewellers - Premium Gold & Silver</p>
              </div>
            </div>
            
            {/* Mobile Menu */}
            <button 
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-4">
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'billing' 
                    ? 'bg-white text-yellow-600 font-semibold' 
                    : 'hover:bg-yellow-500'
                }`}
              >
                <Receipt className="inline mr-2" size={18} />
                बिलिंग / Billing
              </button>
              <button
                onClick={() => setActiveTab('pawn')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'pawn' 
                    ? 'bg-white text-yellow-600 font-semibold' 
                    : 'hover:bg-yellow-500'
                }`}
              >
                <Calculator className="inline mr-2" size={18} />
                तारण / Pawn
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-4 py-2 rounded-lg transition ${
                  activeTab === 'reports' 
                    ? 'bg-white text-yellow-600 font-semibold' 
                    : 'hover:bg-yellow-500'
                }`}
              >
                <Download className="inline mr-2" size={18} />
                रिपोर्ट्स / Reports
              </button>
            </nav>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <nav className="md:hidden mt-4 flex flex-col gap-2">
              <button
                onClick={() => { setActiveTab('billing'); setMenuOpen(false); }}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'billing' ? 'bg-white text-yellow-600' : 'bg-yellow-500'
                }`}
              >
                <Receipt className="inline mr-2" size={18} />
                बिलिंग / Billing
              </button>
              <button
                onClick={() => { setActiveTab('pawn'); setMenuOpen(false); }}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'pawn' ? 'bg-white text-yellow-600' : 'bg-yellow-500'
                }`}
              >
                <Calculator className="inline mr-2" size={18} />
                तारण / Pawn
              </button>
              <button
                onClick={() => { setActiveTab('reports'); setMenuOpen(false); }}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'reports' ? 'bg-white text-yellow-600' : 'bg-yellow-500'
                }`}
              >
                <Download className="inline mr-2" size={18} />
                रिपोर्ट्स / Reports
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'billing' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Billing Form */}
            <div className="bg-white rounded-xl shadow-lg p-6 print:hidden">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="text-yellow-600" />
                नवीन बिल / New Bill
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ग्राहकाचे नाव / Customer Name *
                  </label>
                  <input
                    type="text"
                    value={billing.customerName}
                    onChange={(e) => setBilling({...billing, customerName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="ग्राहकाचे नाव प्रविष्ट करा"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    फोन नंबर / Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={billing.phone}
                    onChange={(e) => setBilling({...billing, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="फोन नंबर प्रविष्ट करा"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    वस्तूचा प्रकार / Item Type
                  </label>
                  <select
                    value={billing.itemName}
                    onChange={(e) => setBilling({...billing, itemName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option>सोने / Gold</option>
                    <option>चांदी / Silver</option>
                    <option>सोन्याचे नाणे / Gold Coin</option>
                    <option>चांदीचे नाणे / Silver Coin</option>
                    <option>दागिने / Jewelry</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      वजन (ग्रॅम) / Weight (g) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={billing.weight}
                      onChange={(e) => setBilling({...billing, weight: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      दर/ग्रॅम (₹) / Rate/g *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={billing.rate}
                      onChange={(e) => setBilling({...billing, rate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    मेकिंग चार्जेस (₹) / Making Charges
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={billing.makingCharges}
                    onChange={(e) => setBilling({...billing, makingCharges: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="gst"
                    checked={billing.gstEnabled}
                    onChange={(e) => setBilling({...billing, gstEnabled: e.target.checked})}
                    className="w-4 h-4 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                  />
                  <label htmlFor="gst" className="text-sm font-medium text-gray-700">
                    GST जोडा (3%) / Add GST (3%)
                  </label>
                </div>

                <button
                  onClick={generateBill}
                  className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-amber-700 transition shadow-lg"
                >
                  बिल तयार करा / Generate Bill
                </button>
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="bg-white rounded-xl shadow-lg p-6" ref={printRef}>
              {invoice ? (
                <div className="print:p-8">
                  <div className="text-center border-b-2 border-yellow-600 pb-4 mb-6">
                    <div className="text-4xl mb-2">💎</div>
                    <h2 className="text-3xl font-bold text-yellow-600">सातरकर ज्वेलर्स</h2>
                    <p className="text-xl font-semibold text-gray-700">Satarkar Jewellers</p>
                    <p className="text-sm text-gray-600 mt-1">प्रीमियम सोने आणि चांदीचे व्यापारी</p>
                    <p className="text-xs text-gray-500">पत्ता: सांगली, महाराष्ट्र</p>
                    <p className="text-xs text-gray-500">फोन: +91 98765 43210 | GST: 27XXXXX1234X1ZX</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <p className="font-semibold">बिल क्र. / Bill No: {invoice.billNo}</p>
                      <p className="text-gray-600">तारीख / Date: {invoice.date}</p>
                      <p className="text-gray-600">वेळ / Time: {invoice.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{invoice.customerName}</p>
                      <p className="text-gray-600">📞 {invoice.phone}</p>
                    </div>
                  </div>

                  <table className="w-full mb-6 text-sm">
                    <thead className="bg-yellow-100">
                      <tr>
                        <th className="text-left p-2">वस्तू / Item</th>
                        <th className="text-right p-2">वजन / Wt</th>
                        <th className="text-right p-2">दर / Rate</th>
                        <th className="text-right p-2">रक्कम / Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">{invoice.itemName}</td>
                        <td className="text-right p-2">{invoice.weight}g</td>
                        <td className="text-right p-2">₹{parseFloat(invoice.rate).toFixed(2)}</td>
                        <td className="text-right p-2">₹{invoice.itemTotal.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td colSpan="3" className="p-2 text-right font-medium">मेकिंग चार्जेस:</td>
                        <td className="text-right p-2">₹{parseFloat(invoice.makingCharges || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td colSpan="3" className="p-2 text-right font-medium">उप-एकूण / Subtotal:</td>
                        <td className="text-right p-2">₹{invoice.subtotal.toFixed(2)}</td>
                      </tr>
                      {invoice.gstEnabled && (
                        <tr className="border-b">
                          <td colSpan="3" className="p-2 text-right font-medium">GST (3%):</td>
                          <td className="text-right p-2">₹{invoice.gst.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="bg-yellow-50 font-bold text-lg">
                        <td colSpan="3" className="p-2 text-right">एकूण रक्कम / Grand Total:</td>
                        <td className="text-right p-2">₹{invoice.total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="border-t pt-4 text-xs text-gray-600">
                    <p className="font-semibold mb-2">अटी व शर्ती / Terms & Conditions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>विकलेला माल परत किंवा बदलला जाणार नाही</li>
                      <li>सर्व विवाद स्थानिक अधिकारक्षेत्राच्या अधीन</li>
                      <li>कृपया दुकान सोडण्यापूर्वी वस्तू तपासून घ्या</li>
                    </ul>
                  </div>

                  <div className="mt-8 text-center text-sm text-gray-500">
                    <p>आपल्या व्यवसायाबद्दल धन्यवाद!</p>
                    <p className="font-semibold">सातरकर ज्वेलर्स / Satarkar Jewellers</p>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition print:hidden flex items-center justify-center gap-2"
                  >
                    <Printer size={18} />
                    प्रिंट करा / Print Invoice
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText size={64} className="mx-auto mb-4 opacity-50" />
                  <p>बिल येथे दिसेल / Invoice will appear here</p>
                  <p className="text-sm">फॉर्म भरा आणि बिल तयार करा क्लिक करा</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pawn' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pawn Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calculator className="text-yellow-600" />
                तारण कॅल्क्युलेटर / Pawn Calculator
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ग्राहकाचे नाव / Customer Name *
                  </label>
                  <input
                    type="text"
                    value={pawn.customerName}
                    onChange={(e) => setPawn({...pawn, customerName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="ग्राहकाचे नाव प्रविष्ट करा"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    फोन नंबर / Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={pawn.phone}
                    onChange={(e) => setPawn({...pawn, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="फोन नंबर प्रविष्ट करा"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    सोन्याचे वजन (ग्रॅम) / Gold Weight (g) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pawn.weight}
                    onChange={(e) => setPawn({...pawn, weight: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    प्रति ग्रॅम दर (₹) / Rate per gram *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pawn.rate}
                    onChange={(e) => setPawn({...pawn, rate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    कर्ज टक्केवारी (%) / Loan Percentage
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={pawn.loanPercentage}
                    onChange={(e) => setPawn({...pawn, loanPercentage: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">सामान्यतः सोन्याच्या किंमतीच्या 75%</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    व्याज दर (% प्रति महिना) / Interest Rate (% per month)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={pawn.interestRate}
                    onChange={(e) => setPawn({...pawn, interestRate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    कर्जाचा कालावधी (महिने) / Loan Duration (months)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={pawn.duration}
                    onChange={(e) => setPawn({...pawn, duration: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={calculatePawn}
                  className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-700 hover:to-amber-700 transition shadow-lg"
                >
                  कर्ज मोजा / Calculate Loan
                </button>
              </div>
            </div>

            {/* Pawn Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              {pawnResult ? (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">कर्जाचा तपशील / Loan Details</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border-b-2">
                      <p className="text-sm text-gray-600">ग्राहक / Customer</p>
                      <p className="text-lg font-bold text-gray-800">{pawnResult.customerName}</p>
                      <p className="text-sm text-gray-600">📞 {pawnResult.phone}</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">सोन्याची किंमत / Gold Value</p>
                      <p className="text-2xl font-bold text-gray-800">₹{pawnResult.goldValue}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">कर्जाची रक्कम ({pawn.loanPercentage}%) / Loan Amount</p>
                      <p className="text-2xl font-bold text-green-600">₹{pawnResult.loanAmount}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-600">मासिक व्याज / Monthly Interest</p>
                        <p className="text-lg font-bold text-blue-600">₹{pawnResult.monthlyInterest}</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-600">एकूण व्याज / Total Interest</p>
                        <p className="text-lg font-bold text-purple-600">₹{pawnResult.totalInterest}</p>
                      </div>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                      <p className="text-sm text-gray-600">एकूण भरावयाची रक्कम / Total Payable</p>
                      <p className="text-3xl font-bold text-red-600">₹{pawnResult.totalPayable}</p>
                      <p className="text-xs text-gray-500 mt-1">{pawn.duration} महिन्यांनंतर / After {pawn.duration} months</p>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-2">सारांश / Summary:</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• वजन / Weight: {pawn.weight}g @ ₹{pawn.rate}/g</li>
                        <li>• व्याज / Interest: {pawn.interestRate}% प्रति महिना</li>
                        <li>• कालावधी / Duration: {pawn.duration} महिने</li>
                        <li>• तारीख / Date: {pawnResult.date}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calculator size={64} className="mx-auto mb-4 opacity-50" />
                  <p>गणना परिणाम येथे दिसतील / Results will appear here</p>
                  <p className="text-sm">फॉर्म भरा आणि कर्ज मोजा क्लिक करा</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Download className="text-yellow-600" />
              Excel रिपोर्ट्स डाउनलोड करा / Download Excel Reports
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-2 border-yellow-200 rounded-lg p-6 hover:border-yellow-400 transition">
                <div className="text-center">
                  <Receipt size={48} className="mx-auto mb-4 text-yellow-600" />
                  <h3 className="text-xl font-bold mb-2">बिलिंग रिपोर्ट / Billing Report</h3>
                  <p className="text-sm text-gray-600 mb-4">सर्व बिलिंग रेकॉर्ड डाउनलोड करा</p>
                  <button
                    onClick={() => downloadExcel('billing')}
                    className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Billing Excel डाउनलोड करा
                  </button>
                  <p className="text-xs text-gray-500 mt-2">सध्याच्या महिन्याची फाईल / Current month file</p>
                </div>
              </div>

              <div className="border-2 border-yellow-200 rounded-lg p-6 hover:border-yellow-400 transition">
                <div className="text-center">
                  <Calculator size={48} className="mx-auto mb-4 text-yellow-600" />
                  <h3 className="text-xl font-bold mb-2">तारण रिपोर्ट / Pawn Report</h3>
                  <p className="text-sm text-gray-600 mb-4">सर्व तारण रेकॉर्ड डाउनलोड करा</p>
                  <button
                    onClick={() => downloadExcel('pawn')}
                    className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Pawn Excel डाउनलोड करा
                  </button>
                  <p className="text-xs text-gray-500 mt-2">सध्याच्या महिन्याची फाईल / Current month file</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <h4 className="font-bold text-blue-800 mb-2">📌 महत्त्वाची माहिती / Important Information:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• प्रत्येक महिन्याला स्वतंत्र Excel फाईल तयार होते</li>
                <li>• सर्व डेटा backend मध्ये सुरक्षितपणे सेव्ह होतो</li>
                <li>• फाईल फॉरमॅट: billing_2026_01.xlsx, pawn_2026_01.xlsx</li>
                <li>• Each month creates a separate Excel file automatically</li>
                <li>• All data is securely saved in backend storage</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-8, .print\\:p-8 * {
            visibility: visible;
          }
          .print\\:p-8 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SatarkarJewellers;