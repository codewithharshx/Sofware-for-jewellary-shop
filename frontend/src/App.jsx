import React, { useState, useRef, useEffect } from 'react';
import {
    Calculator, FileText, Receipt, Download,
    Printer, Menu, X, Gem, User, Phone,
    Scale, IndianRupee, Percent, Calendar, CheckCircle2, AlertCircle,
    Search, Filter, RefreshCw, Table as TableIcon
} from 'lucide-react';

const SatarkarJewellers = () => {
    const [activeTab, setActiveTab] = useState('billing');
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const BACKEND_URL = 'http://localhost:5000';

    // Fetch helper
    const authFetch = (url, options = {}) => {
        return fetch(url, options);
    };

    // Billing State
    const [billing, setBilling] = useState({
        customerName: '',
        phone: '',
        itemName: '',
        weight: '',
        rate: '',
        makingCharges: '',
        gstEnabled: false
    });

    // Pawn State
    const [pawn, setPawn] = useState({
        customerName: '',
        phone: '',
        itemName: '',
        weight: '',
        rate: '',
        loanPercentage: '75',
        interestRate: '1.5',
        duration: '12'
    });

    // Results State
    const [invoice, setInvoice] = useState(null);
    const [pawnResult, setPawnResult] = useState(null);

    // Live Ledger State
    const [ledgerData, setLedgerData] = useState([]);
    const [ledgerType, setLedgerType] = useState('billing');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLedger = async (type = ledgerType) => {
        try {
            const response = await authFetch(`${BACKEND_URL}/api/data/${type}`);
            if (response.ok) {
                const data = await response.json();
                setLedgerData(data.reverse()); // Latest first
            }
        } catch (error) {
            console.error('Failed to fetch ledger:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'ledger') {
            fetchLedger();
        }
    }, [activeTab, ledgerType]);



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

    // Generate Bill
    const generateBill = async () => {
        if (!billing.customerName || !billing.phone || !billing.itemName || !billing.weight || !billing.rate) {
            alert('कृपया सर्व आवश्यक फील्ड भरा / Please fill all required fields');
            return;
        }

        setLoading(true);
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

        try {
            const response = await authFetch(`${BACKEND_URL}/api/bill`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceData)
            });

            if (response.ok) {
                // Success feedback
                console.log('Saved to Excel');
                fetchLedger('billing'); // Update live view
            }
        } catch (error) {
            console.error('Backend error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Pawn
    const calculatePawn = async () => {
        if (!pawn.customerName || !pawn.phone || !pawn.itemName || !pawn.weight || !pawn.rate) {
            alert('कृपया सर्व फील्ड भरा / Please fill all fields');
            return;
        }

        setLoading(true);
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
            itemName: pawn.itemName,
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

        try {
            await authFetch(`${BACKEND_URL}/api/pawn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result)
            });
            fetchLedger('pawn'); // Update live view
        } catch (error) {
            console.error('Backend error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    const downloadExcel = async (type) => {
        const month = new Date().toISOString().slice(0, 7).replace('-', '_');
        const filename = `${type}_${month}.xlsx`;
        window.open(`${BACKEND_URL}/api/download/${type}/${filename}`, '_blank');
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass-header sticky top-0 z-50 no-print">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="w-14 h-14 bg-gradient-to-tr from-gold-400 to-gold-200 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                                <Gem className="text-gold-900 w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gold-100 to-white bg-clip-text text-transparent italic">
                                    सातरकर ज्वेलर्स
                                </h1>
                                <p className="text-sm font-medium text-gold-200/80 uppercase tracking-widest">
                                    Satarkar Jewellers • Fine Jewelry
                                </p>
                            </div>
                        </div>

                        <nav className="hidden md:flex items-center gap-2 bg-white/10 p-1.5 rounded-full border border-white/10">
                            {[
                                { id: 'billing', label: 'बिलिंग / Billing', icon: Receipt },
                                { id: 'pawn', label: 'तारण / Pawn', icon: Calculator },
                                { id: 'ledger', label: 'लाइव्ह लेजर / Live Ledger', icon: TableIcon },
                                { id: 'reports', label: 'रिपोर्ट्स / Reports', icon: Download }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : 'tab-button-inactive'}`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <X size={32} /> : <Menu size={32} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {activeTab === 'billing' && (
                    <div className="grid lg:grid-cols-12 gap-10 items-start">
                        {/* Form Section */}
                        <div className="lg:col-span-5 space-y-8 no-print animate-in fade-in slide-in-from-left duration-700">
                            <div className="glass-card p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-gold-100 rounded-xl text-gold-600">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">नवीन बिल</h2>
                                        <p className="text-gray-500 text-sm">Create a new sale invoice</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 px-1">ग्राहक / Customer</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500" size={18} />
                                            <input
                                                type="text"
                                                placeholder="नाव प्रविष्ट करा"
                                                value={billing.customerName}
                                                onChange={e => setBilling({ ...billing, customerName: e.target.value })}
                                                className="premium-input pl-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 px-1">फोन / Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500" size={18} />
                                            <input
                                                type="tel"
                                                placeholder="नंबर प्रविष्ट करा"
                                                value={billing.phone}
                                                onChange={e => setBilling({ ...billing, phone: e.target.value })}
                                                className="premium-input pl-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 px-1">दागिन्यांचे नाव / Jewellery Name</label>
                                        <div className="relative">
                                            <Gem className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-500" size={18} />
                                            <input
                                                type="text"
                                                placeholder="उदा. अंगठी, हार (e.g. Ring, Necklace)"
                                                value={billing.itemName}
                                                onChange={e => setBilling({ ...billing, itemName: e.target.value })}
                                                className="premium-input pl-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">वजन (g)</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={billing.weight}
                                                onChange={e => setBilling({ ...billing, weight: e.target.value })}
                                                className="premium-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">दर (per g)</label>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={billing.rate}
                                                onChange={e => setBilling({ ...billing, rate: e.target.value })}
                                                className="premium-input"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">मेकिंग चार्जेस</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={billing.makingCharges}
                                            onChange={e => setBilling({ ...billing, makingCharges: e.target.value })}
                                            className="premium-input"
                                        />
                                    </div>

                                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-gold-50/50 rounded-xl border border-gold-100 hover:bg-gold-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={billing.gstEnabled}
                                            onChange={e => setBilling({ ...billing, gstEnabled: e.target.checked })}
                                            className="w-5 h-5 accent-gold-600 cursor-pointer"
                                        />
                                        <span className="text-sm font-semibold text-gray-700">GST जोडा (3%) / Add GST</span>
                                    </label>

                                    <button
                                        onClick={generateBill}
                                        className="premium-button w-full shadow-gold-500/20"
                                        disabled={loading}
                                    >
                                        {loading ? 'प्रक्रिया सुरू आहे...' : 'बिल तयार करा / Generate Bill'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className="lg:col-span-7 animate-in fade-in slide-in-from-right duration-700">
                            {invoice ? (
                                <div className="glass-card overflow-hidden">
                                    <div className="p-8 print:p-0" id="invoice-content">
                                        {/* Invoice Design */}
                                        <div className="border-[3px] border-gold-500 p-8 rounded-xl relative overflow-hidden">
                                            {/* Watermark/Decorative */}
                                            <div className="absolute top-[-50px] right-[-50px] text-[200px] opacity-[0.03] text-gold-900 pointer-events-none">💎</div>

                                            <div className="text-center mb-8 pb-8 border-b-2 border-gold-100">
                                                <Gem className="w-12 h-12 mx-auto mb-3 text-gold-600" />
                                                <h2 className="text-4xl font-extrabold text-gold-700 mb-1">सातरकर ज्वेलर्स</h2>
                                                <p className="font-bold text-gray-600 tracking-wider">SATARKAR JEWELLERS</p>
                                                <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium text-gray-500">
                                                    <span>📍 मालेगाव पंच कंदील, गुरुवार वार्ड ८५ब, नाशिक</span>
                                                    <span>📞 +91 9146412040</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-start mb-8">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">BILL TO</p>
                                                    <p className="text-xl font-bold text-gray-800">{invoice.customerName}</p>
                                                    <p className="text-gray-500 font-medium">{invoice.phone}</p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">INVOICE NO</p>
                                                    <p className="text-lg font-bold text-gold-700">#{invoice.billNo}</p>
                                                    <div className="flex items-center gap-2 justify-end text-sm text-gray-500">
                                                        <Calendar size={14} />
                                                        <span>{invoice.date} • {invoice.time}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-y-2 border-gold-100">
                                                            <th className="py-4 font-bold text-gray-700">विवरण / Description</th>
                                                            <th className="py-4 font-bold text-gray-700 text-right">वजन / Wt</th>
                                                            <th className="py-4 font-bold text-gray-700 text-right">दर / Rate</th>
                                                            <th className="py-4 font-bold text-gray-700 text-right">रक्कम / Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gold-50">
                                                        <tr className="text-gray-700 font-medium">
                                                            <td className="py-6">{invoice.itemName}</td>
                                                            <td className="py-6 text-right font-bold">{invoice.weight}g</td>
                                                            <td className="py-6 text-right font-sans">₹{invoice.rate.toLocaleString('en-IN')}</td>
                                                            <td className="py-6 text-right font-sans font-bold">₹{invoice.itemTotal.toLocaleString('en-IN')}</td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan="3" className="py-4 text-right text-gray-500 font-medium">मेकिंग चार्जेस / Making:</td>
                                                            <td className="py-4 text-right font-sans font-bold text-gray-700">₹{invoice.makingCharges.toLocaleString('en-IN')}</td>
                                                        </tr>
                                                        {invoice.gstEnabled && (
                                                            <tr>
                                                                <td colSpan="3" className="py-4 text-right text-gray-500 font-medium">GST (3%):</td>
                                                                <td className="py-4 text-right font-sans font-bold text-gray-700">₹{invoice.gst.toLocaleString('en-IN')}</td>
                                                            </tr>
                                                        )}
                                                        <tr className="border-t-2 border-gold-200">
                                                            <td colSpan="3" className="py-6 text-right text-gold-800 text-2xl font-black italic">एकूण / Total:</td>
                                                            <td className="py-6 text-right text-gold-600 text-2xl font-black font-sans">₹{invoice.total.toLocaleString('en-IN')}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="mt-12 grid grid-cols-2 gap-10 items-end">
                                                <div className="text-[10px] text-gray-400 space-y-1">
                                                    <p className="mb-2 font-bold text-gray-600 uppercase border-b border-gold-100 w-fit">Terms & Conditions</p>
                                                    <p>• Goods once sold will not be taken back or exchanged.</p>
                                                    <p>• All disputes are subject to Sangli jurisdiction only.</p>
                                                    <p>• Check all items thoroughly before leaving the premesis.</p>
                                                </div>
                                                <div className="text-center space-y-4">
                                                    <div className="h-12 flex items-center justify-center opacity-30 italic text-sm text-gray-400">Signature</div>
                                                    <p className="border-t border-gold-200 pt-2 text-sm font-bold text-gold-800">For Satarkar Jewellers</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4 no-print">
                                        <button onClick={handlePrint} className="premium-button flex-1 flex items-center justify-center gap-2">
                                            <Printer size={18} /> प्रिंट / Print Invoice
                                        </button>
                                        <button onClick={() => setInvoice(null)} className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-white transition-all">
                                            बंद करा / Close
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-gold-200">
                                    <div className="w-24 h-24 bg-gold-50 rounded-full flex items-center justify-center mb-6">
                                        <Receipt className="text-gold-300 w-12 h-12" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-400 mb-2">बिल येथे दिसेल / Invoice Preview</h3>
                                    <p className="text-gray-400 max-w-xs">Fill out the form to generate a premium jewelry invoice</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Similar cool styling for Pawn and Reports sections... */}
                {activeTab === 'pawn' && (
                    <div className="grid lg:grid-cols-12 gap-10 items-start animate-in zoom-in duration-500">
                        <div className="lg:col-span-5 glass-card p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                                    <Calculator size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">तारण कॅल्क्युलेटर</h2>
                                    <p className="text-gray-500 text-sm">Instant Loan Calculation</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {/* Reuse Pawn fields with premium styling */}
                                <input type="text" placeholder="ग्राहक / Customer" value={pawn.customerName} onChange={e => setPawn({ ...pawn, customerName: e.target.value })} className="premium-input" />
                                <input type="tel" placeholder="फोन / Phone" value={pawn.phone} onChange={e => setPawn({ ...pawn, phone: e.target.value })} className="premium-input" />
                                <input type="text" placeholder="दागिन्यांचे नाव / Jewellery Name" value={pawn.itemName} onChange={e => setPawn({ ...pawn, itemName: e.target.value })} className="premium-input" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="वजन (g)" value={pawn.weight} onChange={e => setPawn({ ...pawn, weight: e.target.value })} className="premium-input" />
                                    <input type="number" placeholder="दर (₹)" value={pawn.rate} onChange={e => setPawn({ ...pawn, rate: e.target.value })} className="premium-input" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-1">Loan %</label>
                                        <input type="number" value={pawn.loanPercentage} onChange={e => setPawn({ ...pawn, loanPercentage: e.target.value })} className="premium-input" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-1">Monthly %</label>
                                        <input type="number" value={pawn.interestRate} onChange={e => setPawn({ ...pawn, interestRate: e.target.value })} className="premium-input" />
                                    </div>
                                </div>
                                <input type="number" placeholder="कालावधी (महिने)" value={pawn.duration} onChange={e => setPawn({ ...pawn, duration: e.target.value })} className="premium-input" />

                                <button onClick={calculatePawn} className="premium-button w-full from-emerald-600 to-teal-700 shadow-emerald-500/20">
                                    कर्ज मोजा / Calculate Loan
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            {pawnResult ? (
                                <div className="glass-card overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white">
                                        <h3 className="text-xl font-bold mb-1 italic">तारण तपशील / Loan Summary</h3>
                                        <p className="text-emerald-100 opacity-80 text-sm">{pawnResult.itemName} • #{pawnResult.phone.slice(-4)}-{Date.now().toString().slice(-4)}</p>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Value of Gold</p>
                                                <p className="text-2xl font-black text-gray-800">₹{parseFloat(pawnResult.goldValue).toLocaleString()}</p>
                                            </div>
                                            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Loan Granted</p>
                                                <p className="text-2xl font-black text-emerald-700">₹{parseFloat(pawnResult.loanAmount).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center p-3">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Monthly Int.</p>
                                                <p className="font-bold text-gray-700">₹{parseFloat(pawnResult.monthlyInterest).toLocaleString()}</p>
                                            </div>
                                            <div className="text-center p-3 border-x border-gray-100">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p>
                                                <p className="font-bold text-gray-700">{pawnResult.duration} Months</p>
                                            </div>
                                            <div className="text-center p-3">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Total Int.</p>
                                                <p className="font-bold text-gray-700">₹{parseFloat(pawnResult.totalInterest).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100 text-center relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500"></div>
                                            <p className="text-sm font-bold text-red-600 uppercase mb-2 relative z-10">एकूण भरावयाची रक्कम / Total Payable After {pawnResult.duration} Mos</p>
                                            <p className="text-5xl font-black text-red-700 relative z-10 font-sans tracking-tight">₹{parseFloat(pawnResult.totalPayable).toLocaleString()}</p>
                                        </div>

                                        <div className="flex gap-4">
                                            <button className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">Record Transaction</button>
                                            <button onClick={() => setPawnResult(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold">Clear</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-emerald-200">
                                    <Calculator className="text-emerald-100 w-24 h-24 mb-6" />
                                    <h3 className="text-2xl font-bold text-emerald-900/30">गणना तपशील / Setup Loan</h3>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'ledger' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-black text-gray-800">रियल-टाइम डेटा / Live Ledger</h2>
                                <p className="text-gray-500 font-medium">View and search all transactions in real-time</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setLedgerType('billing')}
                                    className={`px-4 py-2 rounded-xl font-bold transition-all ${ledgerType === 'billing' ? 'bg-gold-600 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                                >
                                    Billing Records
                                </button>
                                <button
                                    onClick={() => setLedgerType('pawn')}
                                    className={`px-4 py-2 rounded-xl font-bold transition-all ${ledgerType === 'pawn' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                                >
                                    Pawn Records
                                </button>
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name, phone, item..."
                                        className="premium-input pl-12"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => fetchLedger()}
                                    className="p-3 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
                                    title="Refresh Data"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            {ledgerData.length > 0 ? Object.keys(ledgerData[0]).map(key => (
                                                <th key={key} className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{key}</th>
                                            )) : (
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">No Data Found</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {ledgerData
                                            .filter(row =>
                                                Object.values(row).some(val =>
                                                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                            )
                                            .map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gold-50/30 transition-colors">
                                                    {Object.values(row).map((val, i) => (
                                                        <td key={i} className="px-6 py-4 text-sm font-medium text-gray-600">
                                                            {typeof val === 'number' && (String(val).includes('.') || val > 1000) ?
                                                                `₹${val.toLocaleString()}` :
                                                                String(val)
                                                            }
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-4xl font-black text-gold-900">व्यवसाय रिपोर्ट्स</h2>
                            <p className="text-gray-500 font-medium">Download your monthly transaction records</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                { type: 'billing', title: 'Billing Data', label: 'Invoices & Sales', icon: Receipt, color: 'gold' },
                                { type: 'pawn', title: 'Pawn Records', label: 'Loans & Pledges', icon: Calculator, color: 'emerald' }
                            ].map(item => (
                                <div key={item.type} className="glass-card p-10 text-center group hover:scale-[1.02] transition-transform duration-300">
                                    <div className={`w-20 h-20 mx-auto mb-6 bg-${item.color}-100 rounded-3xl flex items-center justify-center text-${item.color}-600 group-hover:rotate-12 transition-transform`}>
                                        <item.icon size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h3>
                                    <p className="text-gray-500 mb-8 font-medium">{item.label}</p>
                                    <button
                                        onClick={() => downloadExcel(item.type)}
                                        className={`premium-button w-full shadow-lg ${item.type === 'pawn' ? 'from-emerald-600 to-teal-700' : ''}`}
                                    >
                                        Download Excel Report
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card p-8 bg-gold-900 text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Gem size={100} />
                            </div>
                            <h4 className="flex items-center gap-2 text-gold-300 font-black uppercase tracking-tighter mb-4">
                                <AlertCircle size={20} /> 📌 Important Information
                            </h4>
                            <ul className="grid md:grid-cols-2 gap-4 text-sm font-medium text-gold-100/80">
                                <li>• Daily backups generated automatically</li>
                                <li>• Report filename: <code className="bg-white/10 px-2 py-0.5 rounded text-white">data_[MONTH].xlsx</code></li>
                                <li>• Secured internal backend storage system</li>
                                <li>• Real-time data sync with server</li>
                            </ul>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-20 py-10 border-t border-gray-200 text-center text-gray-400 no-print">
                <p className="font-bold tracking-[0.2em] mb-1">SATARKAR JEWELLERS</p>
                <p className="text-[10px] uppercase font-medium">© 2026 Crafted with Jewel Quality Software</p>
            </footer>
        </div>
    );
};

export default SatarkarJewellers;
