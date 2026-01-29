'use client';

import React, { useState } from 'react';
import {
    Box, Paper, Typography, Grid, TextField, Button,
    FormControl, InputLabel, Select, MenuItem, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- TYPES ---
interface ContractData {
    contractNumber: string;
    date: string;

    // Party A (Buyer)
    partyAName: string;
    partyAAddress: string;
    partyATax: string;
    partyARep: string;
    partyAPosition: string;

    // Party B (Seller)
    partyBName: string;
    partyBAddress: string;
    partyBPhone: string;
    partyBEmail: string;
    partyBTax: string;
    partyBRep: string;
    partyBPosition: string;
    partyBAccount: string;
    partyBBank: string;

    // Terms
    deliveryLocation: string;
    deliveryDays: string;
    depositPercent: number;
    vatRate: number;
}

interface Item {
    id: string;
    productName: string;
    unit: string;
    quantity: number;
    price: number;
}

interface Props {
    quote: any;
    initialData: ContractData;
}

// --- UTILS ---
function readMoney(amount: number) {
    if (isNaN(amount)) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
}

const DOCSO = {
    doc: function (n: number) {
        return new Intl.NumberFormat('vi-VN').format(n);
    }
};

function docTienBangChu(sotien: number) {
    if (!sotien || sotien === 0) return 'Không đồng';
    let text = DOCSO.doc(Math.round(sotien));
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return text + " đồng";
}

// --- COMPONENT ---
export default function ContractGenerator({ quote, initialData }: Props) {
    const [mode, setMode] = useState<'FORM' | 'PREVIEW'>('FORM');
    const [data, setData] = useState<ContractData>(initialData);

    const items = quote.items.map((item: any) => {
        const quantity = Number(item.quantity) || 0;
        const price = Math.round(Number(item.price)) || 0;
        return { ...item, quantity, price, total: quantity * price };
    });

    const totalAmount = items.reduce((acc: number, item: any) => acc + item.total, 0);
    const vatRate = Number(data.vatRate);
    const vatAmount = Math.round(totalAmount * (vatRate / 100));
    const finalAmount = totalAmount + vatAmount;

    const depositPercent = Number(data.depositPercent);
    const amountFirst = Math.round(finalAmount * (depositPercent / 100));
    const amountSecond = finalAmount - amountFirst;

    const handleChange = (field: keyof ContractData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
        setData({ ...data, [field]: e.target.value });
    };

    const handlePrint = () => {
        setTimeout(() => window.print(), 300);
    };

    if (mode === 'FORM') {
        return (
            <Box p={3} maxWidth="1200px" mx="auto">
                <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h5" fontWeight="bold">Thiết lập Hợp đồng</Typography>
                    <Box>
                        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => window.history.back()} sx={{ mr: 2 }}>Quay lại</Button>
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={() => setMode('PREVIEW')}>Xem Hợp đồng (Đã tính toán)</Button>
                    </Box>
                </Box>
                <Paper sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}><Typography variant="h6" color="primary">1. Thông tin chung</Typography></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Số Hợp đồng" value={data.contractNumber} onChange={handleChange('contractNumber')} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Ngày ký (Ngày/Tháng/Năm)" value={data.date} onChange={handleChange('date')} /></Grid>

                        <Grid size={{ xs: 12 }}><Divider /></Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="h6" color="primary" gutterBottom>2. Bên Mua (Bên A)</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}><TextField fullWidth label="Tên Công ty" value={data.partyAName} onChange={handleChange('partyAName')} /></Grid>
                                <Grid size={{ xs: 12 }}><TextField fullWidth label="Địa chỉ" value={data.partyAAddress} onChange={handleChange('partyAAddress')} /></Grid>
                                <Grid size={{ xs: 12 }}><TextField fullWidth label="Mã số thuế" value={data.partyATax} onChange={handleChange('partyATax')} /></Grid>
                                <Grid size={{ xs: 6 }}><TextField fullWidth label="Đại diện" value={data.partyARep} onChange={handleChange('partyARep')} /></Grid>
                                <Grid size={{ xs: 6 }}><TextField fullWidth label="Chức vụ" value={data.partyAPosition} onChange={handleChange('partyAPosition')} /></Grid>
                            </Grid>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="h6" color="primary" gutterBottom>3. Bên Bán (Bên B)</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}><TextField fullWidth label="Tên Công ty" value={data.partyBName} onChange={handleChange('partyBName')} /></Grid>
                                <Grid size={{ xs: 12 }}><TextField fullWidth multiline rows={2} label="Địa chỉ" value={data.partyBAddress} onChange={handleChange('partyBAddress')} /></Grid>
                                <Grid size={{ xs: 6 }}><TextField fullWidth label="Điện thoại" value={data.partyBPhone} onChange={handleChange('partyBPhone')} /></Grid>
                                <Grid size={{ xs: 6 }}><TextField fullWidth label="Email" value={data.partyBEmail} onChange={handleChange('partyBEmail')} /></Grid>
                                <Grid size={{ xs: 12 }}><TextField fullWidth label="Mã số thuế" value={data.partyBTax} onChange={handleChange('partyBTax')} /></Grid>
                                <Grid size={{ xs: 6 }}><TextField fullWidth label="Đại diện" value={data.partyBRep} onChange={handleChange('partyBRep')} /></Grid>
                                <Grid size={{ xs: 6 }}><TextField fullWidth label="Chức vụ" value={data.partyBPosition} onChange={handleChange('partyBPosition')} /></Grid>
                                <Grid size={{ xs: 12 }}><TextField fullWidth label="Số tài khoản" value={data.partyBAccount} onChange={handleChange('partyBAccount')} /></Grid>
                                <Grid size={{ xs: 12 }}><TextField fullWidth label="Tại Ngân hàng" value={data.partyBBank} onChange={handleChange('partyBBank')} /></Grid>
                            </Grid>
                        </Grid>

                        <Grid size={{ xs: 12 }}><Divider /></Grid>

                        <Grid size={{ xs: 12 }}><Typography variant="h6" color="primary">4. Điều khoản</Typography></Grid>
                        <Grid size={{ xs: 12, sm: 4 }}><TextField fullWidth label="Thời gian giao hàng (ngày)" value={data.deliveryDays} onChange={handleChange('deliveryDays')} /></Grid>
                        <Grid size={{ xs: 12, sm: 8 }}><TextField fullWidth label="Địa điểm giao hàng" value={data.deliveryLocation} onChange={handleChange('deliveryLocation')} /></Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                            <FormControl fullWidth><InputLabel>Thuế VAT</InputLabel><Select value={data.vatRate} label="Thuế VAT" onChange={handleChange('vatRate')}><MenuItem value={0}>0%</MenuItem><MenuItem value={8}>8%</MenuItem><MenuItem value={10}>10%</MenuItem></Select></FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}><TextField fullWidth type="number" label="% Tạm ứng" value={data.depositPercent} onChange={handleChange('depositPercent')} /></Grid>
                    </Grid>
                </Paper>
            </Box>
        );
    }

    const dateParts = data.date.split('/');
    const day = dateParts[0] || '...';
    const month = dateParts[1] || '...';
    const year = dateParts[2] || '....';

    return (
        <Box className="print-container" sx={{ fontFamily: '"Times New Roman", Times, serif', bgcolor: '#525659', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
            <Box className="no-print" sx={{ display: 'flex', gap: 2, mb: 2, width: '100%', maxWidth: '210mm', justifyContent: 'flex-end' }}>
                <Button variant="contained" color="inherit" startIcon={<EditIcon />} onClick={() => setMode('FORM')}>Chỉnh sửa</Button>
                <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint}>In Hợp đồng</Button>
            </Box>

            <Paper id="contract-content" sx={{ width: '210mm', minHeight: '297mm', p: '2cm 2cm 2cm 3cm', bgcolor: 'white', color: 'black', boxShadow: 3, mb: 4, fontSize: '13pt', lineHeight: 1.5, textAlign: 'justify' }}>
                <Box textAlign="center" mb={0}>
                    <Typography sx={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', m: 0 }}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Typography>
                    <Typography component="span" sx={{ fontSize: '13pt', fontWeight: 'bold', borderBottom: '1px solid black', paddingBottom: '2px', mb: 1, display: 'inline-block' }}>Độc lập – Tự do – Hạnh phúc</Typography>
                </Box>

                <Box textAlign="center" mb={3} mt={2}>
                    <Typography sx={{ fontSize: '16pt', fontWeight: 'bold', textTransform: 'uppercase', m: 0 }}>HỢP ĐỒNG MUA BÁN</Typography>
                    <Typography sx={{ fontSize: '13pt', fontStyle: 'italic', mt: 0 }}>Số: {data.contractNumber}</Typography>
                </Box>

                <Box mb={2}>
                    <ul style={{ listStyleType: 'disc', margin: 0, paddingLeft: '40px', fontStyle: 'italic', fontSize: '13pt' }}>
                        <li>Căn cứ Bộ Luật Dân sự số 91/2015/QH13 ngày 24/11/2015 của Quốc hội khóa XIII;</li>
                        <li>Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14/06/2005 của Quốc hội khóa XI;</li>
                        <li>Căn cứ nhu cầu và khả năng của hai bên.</li>
                    </ul>
                </Box>

                <Typography sx={{ fontStyle: 'italic', mb: 2, fontSize: '13pt', textAlign: 'center' }}>Hôm nay, ngày {day} tháng {month} năm {year}, chúng tôi gồm có:</Typography>

                <Box mb={2}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '13pt' }}>BÊN MUA (Bên A) : {data.partyAName.toUpperCase()}</Typography>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13pt' }}>
                        <tbody>
                            <tr><td style={{ width: '130px', verticalAlign: 'top' }}>Địa chỉ</td><td style={{ verticalAlign: 'top' }}>: {data.partyAAddress}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Việt Nam</td><td style={{ verticalAlign: 'top' }}></td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Mã số thuế</td><td style={{ verticalAlign: 'top' }}>: {data.partyATax}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Đại diện</td><td style={{ verticalAlign: 'top' }}>: <span style={{ fontWeight: 'bold' }}>{data.partyARep}</span></td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Chức vụ</td><td style={{ verticalAlign: 'top' }}>: {data.partyAPosition}</td></tr>
                        </tbody>
                    </table>
                </Box>

                <Box mb={3}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '13pt' }}>BÊN BÁN (Bên B) : {data.partyBName.toUpperCase()}</Typography>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13pt' }}>
                        <tbody>
                            <tr><td style={{ width: '130px', verticalAlign: 'top' }}>Địa chỉ</td><td style={{ verticalAlign: 'top' }}>: {data.partyBAddress}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Số điện thoại</td><td style={{ verticalAlign: 'top' }}>: {data.partyBPhone}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Email</td><td style={{ verticalAlign: 'top' }}>: {data.partyBEmail}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Mã số thuế</td><td style={{ verticalAlign: 'top' }}>: {data.partyBTax}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Đại diện</td><td style={{ verticalAlign: 'top' }}>: <span style={{ fontWeight: 'bold' }}>{data.partyBRep}</span></td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Chức vụ</td><td style={{ verticalAlign: 'top' }}>: {data.partyBPosition}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Số tài khoản</td><td style={{ verticalAlign: 'top' }}>: {data.partyBAccount}</td></tr>
                            <tr><td style={{ verticalAlign: 'top' }}>Tại</td><td style={{ verticalAlign: 'top' }}>: {data.partyBBank}</td></tr>
                        </tbody>
                    </table>
                </Box>

                <Typography sx={{ mb: 2, fontSize: '13pt' }}>Sau khi bàn bạc hai bên thống nhất ký kết hợp đồng kinh tế với những điều khoản sau đây:</Typography>

                <Box mb={2}>
                    <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '13pt' }}>Điều 1: Nội dung và giá trị hợp đồng</Typography>
                    <Typography sx={{ mb: 1, textIndent: '30px', fontSize: '13pt' }}>Bên B đồng ý bán, Bên A đồng ý mua mặt hàng sau:</Typography>

                    <TableContainer sx={{ border: '1px solid black', mb: 1 }}>
                        <Table size="small" sx={{ '& td, & th': { border: '1px solid black', color: 'black', fontSize: '13pt', px: 1, py: 0.7, fontFamily: '"Times New Roman"' }, '& th': { fontWeight: 'bold', textAlign: 'center' } }}>
                            <TableHead><TableRow><TableCell width="50px" align="center">STT</TableCell><TableCell align="center">Tên hàng hóa</TableCell><TableCell width="80px" align="center">ĐVT</TableCell><TableCell width="80px" align="center">Số lượng</TableCell><TableCell width="120px" align="center">Đơn giá</TableCell><TableCell width="140px" align="center">Thành Tiền</TableCell></TableRow></TableHead>
                            <TableBody>
                                {items.map((item: any, index: number) => (
                                    <TableRow key={item.id}>
                                        <TableCell align="center">{index + 1}</TableCell>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell align="center">{item.unit}</TableCell>
                                        <TableCell align="center">{item.quantity}</TableCell>
                                        <TableCell align="right">{readMoney(item.price)}</TableCell>
                                        <TableCell align="right">{readMoney(item.total)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow><TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>Tổng Cộng</TableCell><TableCell align="right" sx={{ fontWeight: 'bold' }}>{readMoney(totalAmount)}</TableCell></TableRow>
                                <TableRow><TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>Thuế GTGT ({data.vatRate}%)</TableCell><TableCell align="right" sx={{ fontWeight: 'bold' }}>{readMoney(vatAmount)}</TableCell></TableRow>
                                <TableRow><TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>Tổng giá trị hợp đồng</TableCell><TableCell align="right" sx={{ fontWeight: 'bold' }}>{readMoney(finalAmount)}</TableCell></TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Typography sx={{ fontStyle: 'italic', fontSize: '13pt', mt: 1 }}>(Bằng chữ: {docTienBangChu(finalAmount)})</Typography>
                </Box>

                <Box mb={2}>
                    <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '13pt' }}>Điều 2: Chất lượng – Quy cách</Typography>
                    <Typography sx={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '13pt', mt: 1 }}>2.1. Mẫu mã và chất liệu:</Typography>
                    <ul style={{ margin: 0, paddingLeft: '30px', listStyleType: 'disc', fontSize: '13pt' }}>
                        <li style={{ marginBottom: '8px' }}>Quy định chi tiết về kỹ thuật và sản phẩm.</li>
                        <li style={{ marginBottom: '8px' }}>Sản phẩm được sản xuất theo mẫu Bên A thông báo cho Bên B. Bên B phải bảo lưu bất kỳ quyền sở hữu trí tuệ nào đối với các mẫu sản phẩm của Bên A.</li>
                        <li style={{ marginBottom: '8px' }}>Bên A cung cấp cho Bên B mẫu thiết kế nội dung in trên sản phẩm và Bên B sẽ sử dụng mẫu thiết kế này để in ấn lên sản phẩm theo yêu cầu của Bên A.</li>
                    </ul>
                    <Typography sx={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '13pt', mt: 1 }}>2.2 Chất lượng Sản phẩm:</Typography>
                    <ul style={{ margin: 0, paddingLeft: '30px', listStyleType: 'disc', fontSize: '13pt' }}>
                        <li style={{ marginBottom: '8px' }}>Hàng mới 100%, chưa qua sử dụng, chất lượng tốt, đảm bảo các chỉ tiêu, thông số kỹ thuật theo đúng Catalog của nhà sản xuất; đảm bảo đúng mặt hàng nêu trên đơn đặt hàng và hàng phải đạt yêu cầu sử dụng của Bên A.</li>
                        <li style={{ marginBottom: '8px' }}>Trường hợp phải chỉnh sửa hoặc phát sinh sai lỗi khi nghiệm thu, trong 1-7 ngày kể từ khi nhận được hàng Bên A phải báo lại ngay cho Bên B để Bên B hoàn thành việc chỉnh sửa. Sau 7 ngày các chi phí sửa phát sinh sẽ do Bên A chịu.</li>
                    </ul>
                    <Typography sx={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '13pt', mt: 1 }}>2.3 Quy cách sản phẩm hoàn thiện:</Typography>
                    <ul style={{ margin: 0, paddingLeft: '30px', listStyleType: 'disc', fontSize: '13pt' }}>
                        <li style={{ marginBottom: '8px' }}>Sản phẩm hoàn thiện phải được rạch khuyết cẩn thận, rạch khuyết hết múi thừa, được nhặt chỉ sạch sẽ, không có chỉ thừa.</li>
                        <li style={{ marginBottom: '8px' }}>Sản phẩm được đóng gói vào bao bì nilon/1 sản phẩm.</li>
                    </ul>
                </Box>

                <Box mb={2}>
                    <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '13pt' }}>Điều 3: Thời gian và địa điểm giao hàng</Typography>
                    <ul style={{ margin: 0, paddingLeft: '30px', listStyleType: 'disc', fontSize: '13pt' }}>
                        <li style={{ marginBottom: '8px' }}>Thời gian giao hàng: Bên B tiến hành giao hàng trong vòng {data.deliveryDays} ngày kể từ ngày bên A gửi đơn đặt hàng.</li>
                        <li style={{ marginBottom: '8px' }}>Địa điểm giao hàng: {data.deliveryLocation}</li>
                    </ul>
                </Box>

                <Box mb={2}>
                    <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '13pt' }}>Điều 4: Phương thức thanh toán và tiến độ thanh toán</Typography>
                    <ul style={{ margin: 0, paddingLeft: '30px', listStyleType: 'disc', fontSize: '13pt' }}>
                        <li style={{ marginBottom: '8px' }}>Phương thức thanh toán: Chuyển khoản.</li>
                        <li style={{ marginBottom: '8px' }}>Loại tiền thanh toán: Việt Nam đồng (VNĐ).</li>
                        <li style={{ marginBottom: '8px' }}>Tiến độ thanh toán: Bên A thanh toán cho Bên B thành 2 lần như sau:</li>
                    </ul>
                    <Box pl={0} sx={{ fontSize: '13pt' }}>
                        <Typography sx={{ mt: 1, fontSize: '13pt' }}><span style={{ textDecoration: 'underline', paddingLeft: '20px' }}>Lần 1:</span> Sau khi hợp đồng được ký kết Bên A thanh toán cho Bên B {data.depositPercent}% tương ứng với số tiền là: <strong>{readMoney(amountFirst)} đồng.</strong></Typography>
                        <Typography sx={{ fontStyle: 'italic', fontSize: '13pt', paddingLeft: '20px', mb: 1 }}>(Bằng chữ: {docTienBangChu(amountFirst)})</Typography>
                        <Typography sx={{ mt: 1, fontSize: '13pt' }}><span style={{ textDecoration: 'underline', paddingLeft: '20px' }}>Lần 2:</span> Thanh toán giá trị còn lại của hợp đồng và các khoản chi phí phát sinh (nếu có) tại thời điểm Bên B giao hàng, đồng thời Bên B bàn giao đầy đủ cho Bên A các chứng từ gồm:</Typography>
                        <ul style={{ margin: 0, paddingLeft: '50px', listStyleType: 'circle', fontSize: '13pt' }}>
                            <li style={{ marginBottom: '5px' }}>Hoá đơn tài chính hợp pháp và hợp lệ</li>
                            <li style={{ marginBottom: '5px' }}>Biên bản bàn giao hàng hoá.</li>
                        </ul>
                        <Typography sx={{ mt: 1, fontSize: '13pt', paddingLeft: '20px' }}>Tổng giá trị thanh toán lần 2 là: <strong>{readMoney(amountSecond)} đồng.</strong></Typography>
                        <Typography sx={{ fontStyle: 'italic', fontSize: '13pt', paddingLeft: '20px' }}>(Bằng chữ: {docTienBangChu(amountSecond)})</Typography>
                    </Box>
                </Box>

                <Box mb={2}>
                    <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '13pt' }}>Điều 5: Trách nhiệm các bên</Typography>
                    <Typography sx={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '13pt', mt: 1 }}>5.1. Trách nhiệm của Bên A:</Typography>
                    <ul style={{ margin: 0, paddingLeft: '30px', listStyleType: 'disc', fontSize: '13pt' }}>
                        <li style={{ marginBottom: '8px' }}>Tạo điều kiện thuận lợi cho Bên B trong việc giao hàng.</li>
                        <li style={{ marginBottom: '8px' }}>Bảo đảm việc thanh toán cho Bên B đúng như trong Điều 4 của hợp đồng này.</li>
                        <li style={{ marginBottom: '8px' }}>Cử đại diện để kiểm tra hàng hóa và giao nhận hàng cùng nhân viên Bên B tại địa điểm nhận hàng của Bên A.</li>
                        <li style={{ marginBottom: '8px' }}>Trong trường hợp Bên A chậm thanh toán cho Bên B theo điều 4 của hợp đồng, thì Bên A phải chịu lãi suất 0.8%/ ngày trên toàn bộ giá trị của phần chưa thanh toán, tổng phạt không quá 8% giá trị hợp đồng. Nếu quá 7 ngày theo thời hạn thỏa thuận mà Bên A không thanh toán cho Bên B mà không có lý do chính đáng hoặc phù hợp với thỏa thuận của hai bên thì sẽ thực hiện hợp đồng theo điều khoản 6 của Hợp đồng này.</li>
                    </ul>
                    <Typography sx={{ fontStyle: 'italic', fontWeight: 'bold', fontSize: '13pt', mt: 1 }}>5.2. Trách nhiệm của Bên B:</Typography>
                    <ul style={{ margin: 0, paddingLeft: '30px', listStyleType: 'disc', fontSize: '13pt' }}>
                        <li style={{ marginBottom: '8px' }}>Chịu trách nhiệm giao hàng đến đúng địa chỉ được quy định trong Điều 3.</li>
                        <li style={{ marginBottom: '8px' }}>Đảm bảo về chất lượng, kiểu dáng của sản phẩm và thời gian đã được quy định trong hợp đồng.</li>
                        <li style={{ marginBottom: '8px' }}>Có trách nhiệm làm lại hoặc chỉnh sửa những sản phẩm không đạt yêu cầu của Bên A trong vòng 15 sau khi nhận hàng (không tính thứ 7, chủ nhật, ngày lễ).</li>
                        <li style={{ marginBottom: '8px' }}>Trong trường hợp Bên B giao hàng cho Bên A trễ hạn theo điều 3 của hợp đồng thì Bên B phải chịu phạt 0.8%/ngày cho giá trị của lô hàng giao chậm, nhưng không quá 8% giá trị hợp đồng. Thời gian chậm tối đa 30 ngày. Nếu vi phạm điều khoản trên Bên A có quyền đơn phương chấm dứt hợp đồng mà không phải chịu bất cứ trách nhiệm gì.</li>
                    </ul>
                </Box>

                <Box mb={2}>
                    <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '13pt' }}>Điều 6: Giải quyết tranh chấp</Typography>
                    <ul style={{ margin: 0, paddingLeft: '30px', listStyleType: 'disc', fontSize: '13pt' }}>
                        <li style={{ marginBottom: '8px' }}>Mọi vấn đề phát sinh trong quá trình thực hiện Hợp đồng này, trước tiên sẽ được các bên giải quyết trên tinh thần hoà giải, thiện chí, tôn trọng lợi ích của nhau. Trong trường hợp không thể giải quyết bằng đàm phán và thương lượng thì tranh chấp sẽ được hai bên đề nghị Toà án có thẩm quyền tại tỉnh Ninh Bình giải quyết theo quy định của Pháp luật hiện hành.</li>
                    </ul>
                </Box>

                <Box mb={4}>
                    <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '13pt' }}>Điều 7: Điều khoản chung</Typography>
                    <ul style={{ margin: 0, paddingLeft: '30px', listStyleType: 'disc', fontSize: '13pt' }}>
                        <li style={{ marginBottom: '8px' }}>Hai bên cam kết thực hiện đúng các điều khoản ghi trong hợp đồng trên tinh thần hợp tác.</li>
                        <li style={{ marginBottom: '8px' }}>Trong quá trình thực hiện, nếu có gì phát sinh hai bên sẽ thông báo với nhau bằng văn bản.</li>
                        <li style={{ marginBottom: '8px' }}>Mọi tranh chấp xảy ra trong quá trình thực hiện hợp đồng hai bên sẽ gặp nhau thỏa thuận giải quyết và được thể hiện bằng các phụ lục bổ sung kèm theo.</li>
                        <li style={{ marginBottom: '8px' }}>Trường hợp có những ý kiến không thể thống nhất giữa hai bên thì đưa ra tòa án [Theo quy định] giải quyết, quyết định của tòa án là quyết định cuối cùng, chi phí Tòa Án do bên thua kiện chịu.</li>
                        <li style={{ marginBottom: '8px' }}>Hợp đồng này là thông tin thương mại mật giữa hai bên. Trừ trường hợp do yêu cầu của cơ quan Nhà nước có thẩm quyền, các bên có trách nhiệm bảo mật các nội dung của hợp đồng.</li>
                        <li style={{ marginBottom: '8px' }}>Sau 07 ngày kể từ ngày hai bên hoàn tất các nghĩa vụ đối với nhau và không bên nào có thắc mắc, khiếu nại gì thì hợp đồng này coi như được thanh lý.</li>
                        <li style={{ marginBottom: '8px' }}>Hợp đồng được thành lập 04 bản, mỗi bên giữ 02 bản có giá trị pháp lý như nhau. Hợp đồng có hiệu lực kể từ ngày ký.</li>
                    </ul>
                </Box>

                {/* Signatures */}
                <Box display="flex" justifyContent="space-between" mt={4} sx={{ pageBreakInside: 'avoid' }}>
                    <Box textAlign="center" width="45%">
                        <Typography sx={{ fontWeight: 'bold', fontSize: '13pt' }}>ĐẠI DIỆN BÊN A</Typography>
                        <Box height="150px" />
                        <Typography sx={{ fontWeight: 'bold', fontSize: '13pt' }}>{data.partyARep}</Typography>
                    </Box>
                    <Box textAlign="center" width="45%">
                        <Typography sx={{ fontWeight: 'bold', fontSize: '13pt', fontFamily: '"Times New Roman"' }}>ĐẠI DIỆN BÊN B</Typography>
                        {/* Digital Signature with Image */}
                        <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <img
                                src="/signature.png"
                                alt="Signature"
                                style={{
                                    width: '280px',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            />
                        </Box>
                    </Box>
                </Box>

            </Paper>

            <style>{`
                @media print {
                    @page { margin: 2cm 2cm 2cm 3cm; size: A4; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                    .print-container { background: white !important; padding: 0 !important; width: 100%; height: 100%; display: block !important; }
                    .no-print { display: none !important; }
                    #contract-content { 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        width: 100% !important; 
                        min-height: auto !important; 
                        padding: 0 !important; 
                        page-break-after: always;
                    }
                    /* STRICT TYPOGRAPHY FOR VIETNAMESE CONTRACTS */
                    * { 
                        font-family: "Times New Roman", Times, serif !important; 
                        
                    }
                    p, li, div, span, td, th {
                        font-size: 13pt !important;
                        line-height: 1.5 !important;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        font-family: "Times New Roman", Times, serif !important; 
                        line-height: 1.3 !important;
                    }
                    .MuiTypography-root { font-family: "Times New Roman", Times, serif !important; }
                    .MuiTableCell-root { font-family: "Times New Roman", Times, serif !important; }
                    .MuiInputBase-input { font-family: "Times New Roman", Times, serif !important; }
                }
            `}</style>
        </Box>
    );
}
