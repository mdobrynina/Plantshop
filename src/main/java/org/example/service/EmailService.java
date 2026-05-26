package org.example.service;

import jakarta.annotation.PostConstruct;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.example.model.Order;
import org.example.model.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Properties;

@Slf4j
@Service
public class EmailService {

    @Value("${spring.mail.host:}")            private String host;
    @Value("${spring.mail.port:465}")         private int    port;
    @Value("${spring.mail.username:}")        private String username;
    @Value("${spring.mail.password:}")        private String password;
    @Value("${app.mail.from:noreply@moh.ru}") private String from;

    private Session session;

    @PostConstruct
    private void init() {
        if (host == null || host.isBlank()) {
            log.warn("spring.mail.host не задан — почта отключена");
            return;
        }
        Properties props = new Properties();
        props.put("mail.smtp.host",              host);
        props.put("mail.smtp.port",              String.valueOf(port));
        props.put("mail.smtp.auth",              "true");
        props.put("mail.smtp.starttls.enable",   "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.timeout",           "15000");
        props.put("mail.smtp.connectiontimeout", "15000");

        final String u = username, p = password;
        session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(u, p);
            }
        });
        log.info("Mail session создана: {}:{} ({})", host, port, username);
    }

    @Async
    public void sendOrderReceipt(String toEmail, String clientName, Order order) {
        if (session == null) {
            log.warn("Почта не настроена — чек не отправлен (заказ #{})", order.getId());
            return;
        }
        try {
            MimeMessage msg = new MimeMessage(session);
            msg.setFrom(new InternetAddress(from, "MOH Plant Shop", "UTF-8"));
            msg.setRecipient(Message.RecipientType.TO, new InternetAddress(toEmail));
            msg.setSubject("Заказ #" + order.getId() + " — MOH Plant Shop", "UTF-8");
            msg.setContent(buildHtml(clientName, order), "text/html; charset=UTF-8");
            Transport.send(msg);
            log.info("Чек отправлен на {}", toEmail);
        } catch (Exception e) {
            log.warn("Не удалось отправить чек на {}: {} | cause: {}", toEmail, e.getMessage(),
                e.getCause() != null ? e.getCause().getMessage() : "—");
        }
    }

    private String buildHtml(String clientName, Order order) {
        StringBuilder rows = new StringBuilder();
        for (OrderItem item : order.getItems()) {
            String name     = item.getProduct() != null ? item.getProduct().getName() : "Товар";
            int    qty      = item.getQuantity();
            BigDecimal price    = item.getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(qty));
            rows.append("""
                    <tr>
                      <td style="padding:8px 12px;border-bottom:1px solid #e8f0ea;">%s</td>
                      <td style="padding:8px 12px;border-bottom:1px solid #e8f0ea;text-align:center;">%d шт.</td>
                      <td style="padding:8px 12px;border-bottom:1px solid #e8f0ea;text-align:right;font-weight:600;">%s ₽</td>
                    </tr>
                    """.formatted(name, qty, subtotal.toPlainString()));
        }

        String delivery = "delivery".equalsIgnoreCase(order.getDeliveryType()) ? "Доставка курьером" : "Самовывоз";
        String address  = order.getAddress() != null ? order.getAddress() : "—";

        return """
                <!DOCTYPE html>
                <html lang="ru">
                <head><meta charset="UTF-8"/></head>
                <body style="margin:0;padding:0;background:#f5f8f5;font-family:sans-serif;color:#2a2a2a;">
                  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
                    <div style="background:#2f4a3a;padding:28px 32px;">
                      <h1 style="margin:0;color:#fff;font-size:22px;">🌿 MOH Plant Shop</h1>
                      <p style="margin:6px 0 0;color:#a8c4b0;font-size:14px;">Ваш заказ принят!</p>
                    </div>
                    <div style="padding:28px 32px;">
                      <p style="margin:0 0 16px;">Привет, <b>%s</b>!</p>
                      <p style="margin:0 0 20px;color:#6b7872;">Заказ <b>#%d</b> уже в обработке.</p>
                      <table style="width:100%%;border-collapse:collapse;margin-bottom:20px;">
                        <thead>
                          <tr style="background:#e8f0ea;">
                            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6b7872;font-weight:600;">Товар</th>
                            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#6b7872;font-weight:600;">Кол-во</th>
                            <th style="padding:10px 12px;text-align:right;font-size:13px;color:#6b7872;font-weight:600;">Сумма</th>
                          </tr>
                        </thead>
                        <tbody>%s</tbody>
                      </table>
                      <div style="background:#e8f0ea;border-radius:8px;padding:14px 16px;margin-bottom:20px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                          <span style="color:#6b7872;font-size:14px;">Итого</span>
                          <span style="font-weight:700;font-size:16px;">%s ₽</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                          <span style="color:#6b7872;font-size:14px;">Доставка</span>
                          <span style="font-size:14px;">%s</span>
                        </div>
                        %s
                      </div>
                      <p style="font-size:13px;color:#6b7872;margin:0;">По вопросам: <a href="mailto:moh@flowers.ru" style="color:#2f4a3a;">moh@flowers.ru</a></p>
                    </div>
                    <div style="padding:16px 32px;background:#f5f8f5;text-align:center;font-size:12px;color:#a0aba3;">
                      © 2026 MOH Plant Shop
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(
                clientName,
                order.getId(),
                rows.toString(),
                order.getTotal().toPlainString(),
                delivery,
                address.equals("—") ? "" :
                    "<div style=\"margin-top:6px;\"><span style=\"color:#6b7872;font-size:14px;\">Адрес</span>&nbsp;&nbsp;<span style=\"font-size:14px;\">%s</span></div>".formatted(address)
        );
    }
}
