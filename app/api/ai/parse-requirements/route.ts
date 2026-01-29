import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();
        const lowerText = text.toLowerCase();

        // 1. Extract Quantity
        const quantityMatch = lowerText.match(/(\d+)\s*(cái|bộ|áo|chiếc|pcs)/) || lowerText.match(/sl\s*[:.]?\s*(\d+)/) || lowerText.match(/(\d+)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 0;
        const unit = quantityMatch && quantityMatch[2] ? quantityMatch[2] : "Cái";

        // 2. Identify Product Name
        const parts = text.split(/[,.;\n]/);
        let productName = parts.find((p: string) => /áo|quần|đồng phục|nón|mũ|tạp dề/i.test(p)) || parts[0];
        productName = productName.replace(/^\d+\s*/, '').replace(/sl\s*\d+/i, '').trim();
        const capitalizedProduct = productName.charAt(0).toUpperCase() + productName.slice(1);

        // 3. Extract Attributes (Smart Classification)
        const categories = {
            materials: ['cotton', 'poly', 'cá sấu', 'thun', 'kaki', 'kate', 'lạnh', 'ni', 'gió', 'mesh'],
            colors: ['xanh', 'đỏ', 'tím', 'vàng', 'đen', 'trắng', 'cam', 'hồng', 'xám', 'ghi', 'navy', 'be'],
            techs: ['in', 'thêu', 'logo', 'decal', 'chuyển nhiệt'],
            styles: ['cổ trụ', 'cổ bẻ', 'cổ tròn', 'tay dài', 'tay ngắn', 'xẻ tà', 'bo dệt', 'túi']
        };

        const found: Record<string, string[]> = { materials: [], colors: [], techs: [], styles: [] };

        // Scan text for keywords
        for (const [key, keywords] of Object.entries(categories)) {
            keywords.forEach(kw => {
                if (lowerText.includes(kw)) found[key].push(kw);
            });
        }

        // 4. Construct Professional & Emotional Description
        let professionalDesc = `Được thiết kế nhằm nâng tầm hình ảnh chuyên nghiệp cho đội ngũ, mẫu ${capitalizedProduct} này là sự kết hợp hài hòa giữa tính thẩm mỹ và công năng sử dụng.\n\n`;

        // Material Sentence (Focus on Feeling/Comfort)
        if (found.materials.length > 0) {
            professionalDesc += `Chúng tôi lựa chọn chất liệu ${found.materials.join(', ')} đã qua xử lý kỹ lưỡng. Bề mặt vải không chỉ mềm mại, thân thiện với làn da mà còn mang lại cảm giác thoáng mát, nhẹ nhàng, giúp người mặc luôn cảm thấy tự tin và thoải mái trong suốt ngày dài làm việc.\n`;
        } else {
            professionalDesc += `Chất liệu vải được tuyển chọn nghiêm ngặt dựa trên tiêu chí: thoáng mát, bền bỉ và giữ phom dáng tốt qua nhiều lần giặt, đảm bảo sự chỉn chu cần thiết cho môi trường công sở/nhà xưởng.\n`;
        }

        // Color Sentence (Focus on Identity/Harmony)
        if (found.colors.length > 0) {
            professionalDesc += `Gam màu ${found.colors.join(' phối ')} được cân nhắc tỷ mỉ để vừa làm nổi bật nhận diện thương hiệu, vừa giữ được nét thanh lịch, trang nhã.\n`;
        } else {
            professionalDesc += `Màu sắc sẽ được đối chiếu trực tiếp trên bảng màu thực tế để đảm bảo độ chuẩn xác nhất với bộ nhận diện thương hiệu của Quý khách.\n`;
        }

        // Style/Sewing Sentence (Focus on Craftsmanship/Fit)
        if (found.styles.length > 0) {
            professionalDesc += `Từng đường kim mũi chỉ được chăm chút kỹ lưỡng với kiểu dáng ${found.styles.join(', ')}, tạo nên phom áo vừa vặn, tôn dáng nhưng vẫn đảm bảo sự linh hoạt khi vận động.\n`;
        } else {
            professionalDesc += `Phom dáng được nghiên cứu để phù hợp với vóc dáng người Việt, kết hợp cùng kỹ thuật may sắc sảo tại các vị trí quan trọng giúp sản phẩm luôn bền đẹp.\n`;
        }

        // Printing/Logo Sentence (Focus on Precision)
        if (found.techs.length > 0) {
            professionalDesc += `Điểm nhấn thương hiệu được thể hiện qua công nghệ ${found.techs.join(', ')} hiện đại, cho hình ảnh sắc nét, bền màu và tinh tế đến từng chi tiết nhỏ.\n`;
        }

        // Add a closing touch
        professionalDesc += `\n(Mô tả chi tiết này sẽ là cơ sở để bộ phận kỹ thuật tiến hành sản xuất mẫu xác nhận).`;

        // 5. Check Missing Info
        const missingInfo = [];
        if (found.colors.length === 0) missingInfo.push('Màu sắc cụ thể');
        if (found.materials.length === 0) missingInfo.push('Chất liệu vải');
        if (!lowerText.includes('size') && !lowerText.includes('kích thước')) missingInfo.push('Bảng size');

        // Simulate AI thinking time
        await new Promise(r => setTimeout(r, 600));

        return NextResponse.json({
            productName: capitalizedProduct,
            quantity: quantity,
            unit: unit,
            technicalNote: professionalDesc.trim(), // The generated "AI" text
            description: text,
            missingInfo: missingInfo
        });

    } catch (error: any) {
        console.error("PARSER_ERROR", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
