package com.travelguide.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.travelguide.entity.QrCode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.EnumMap;
import java.util.Map;

@Service
public class QrImageService {

    public byte[] png(String content, int size) {
        try {
            BitMatrix matrix = matrix(content, size);
            BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", out);
            return out.toByteArray();
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Cannot generate QR image: " + ex.getMessage());
        }
    }

    public String svg(String content, int size) {
        try {
            BitMatrix matrix = matrix(content, size);
            int width = matrix.getWidth();
            StringBuilder sb = new StringBuilder();
            sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
            sb.append("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 ")
                    .append(width).append(' ').append(width)
                    .append("\" width=\"").append(width).append("\" height=\"").append(width).append("\">\n");
            sb.append("<rect width=\"100%\" height=\"100%\" fill=\"#ffffff\"/>\n");
            sb.append("<path fill=\"#000000\" d=\"");
            for (int y = 0; y < width; y++) {
                for (int x = 0; x < width; x++) {
                    if (matrix.get(x, y)) {
                        sb.append("M").append(x).append(' ').append(y).append("h1v1h-1z");
                    }
                }
            }
            sb.append("\"/>\n</svg>\n");
            return sb.toString();
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Cannot generate QR SVG: " + ex.getMessage());
        }
    }

    /**
     * Print-ready PNG with the station/POI caption below the QR (FR-CMS-16).
     */
    public byte[] printPng(QrCode qr, String title, String subtitle) {
        int width = 900;
        int height = 1200;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        try {
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, width, height);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            int qrSize = 700;
            BitMatrix matrix = matrix(qr.getCode(), qrSize);
            BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(matrix);
            g.drawImage(qrImage, (width - qrSize) / 2, 90, qrSize, qrSize, null);

            g.setColor(new Color(20, 50, 90));
            g.setFont(new Font("SansSerif", Font.BOLD, 42));
            drawCentered(g, safe(title, "Auto Narration"), width, 880);
            g.setColor(Color.DARK_GRAY);
            g.setFont(new Font("SansSerif", Font.PLAIN, 30));
            drawCentered(g, safe(subtitle, ""), width, 935);
            g.setFont(new Font("Monospaced", Font.PLAIN, 26));
            drawCentered(g, "Code: " + qr.getCode(), width, 1010);
            g.setFont(new Font("SansSerif", Font.PLAIN, 22));
            drawCentered(g, "Quét mã để nghe thuyết minh • Scan to listen", width, 1080);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Cannot generate print image: " + ex.getMessage());
        } finally {
            g.dispose();
        }
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Cannot generate print image: " + ex.getMessage());
        }
    }

    private BitMatrix matrix(String content, int size) throws Exception {
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(EncodeHintType.CHARACTER_SET, StandardCharsets.UTF_8.name());
        hints.put(EncodeHintType.MARGIN, 2);
        return new QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, size, size, hints);
    }

    private void drawCentered(Graphics2D g, String text, int width, int y) {
        FontMetrics metrics = g.getFontMetrics();
        int x = (width - metrics.stringWidth(text)) / 2;
        g.drawString(text, Math.max(10, x), y);
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
