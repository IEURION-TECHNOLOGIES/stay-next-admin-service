export const emailTemplate = (action, user, extra = {}) => {
  let title = "";
  let body = "";

  switch (action) {
    // ✅ Agent Approved Email
    case "agentApproved":
      title = "🎉 Your Agent Account Has Been Approved!";
      body = `
        <p style="color: #374151; font-size: 15px;">Congratulations <strong>${user.name}</strong>! 🎉</p>
        <p style="color: #4b5563;">Your application as an <strong>Agent</strong> on <b>StayNext</b> has been reviewed and <strong>approved</strong>.</p>
        <p style="margin-top: 15px;">You can now log in and start managing your properties and clients.</p>
        <a href="${extra.loginLink || "#"}"
           style="display: inline-block; margin-top: 25px; background: linear-gradient(135deg, #16a34a, #22c55e); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 15px;">
          🚀 Login to Dashboard
        </a>
      `;
      break;

    // ❌ Agent Deleted / Rejected Email
    case "agentDeleted":
      title = "⚠️ Your Agent Account Has Been Removed";
      body = `
        <p style="color: #374151; font-size: 15px;">Hello <strong>${user.name}</strong>,</p>
        <p style="color: #dc2626;">We regret to inform you that your <strong>Agent account</strong> has been deleted from <b>StayNext</b>.</p>
        ${
          extra.reason
            ? `<div style="margin: 20px auto; max-width: 480px; background: #fff7ed; padding: 16px; border-radius: 8px; border: 1px solid #f97316;">
                <p style="margin: 0; color: #9a3412;"><strong>Reason:</strong> ${extra.reason}</p>
              </div>`
            : ""
        }
        <p style="margin-top: 18px; color: #6b7280;">If you believe this was done in error, please contact our support team.</p>
        <a href="${extra.supportLink || "#"}"
           style="display: inline-block; margin-top: 25px; background: linear-gradient(135deg, #dc2626, #ef4444); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 15px;">
          📩 Contact Support
        </a>
      `;
      break;

    default:
      title = "📩 Notification from StayNext";
      body = `<p style="color: #4b5563; font-size: 15px;">You have a new notification.</p>`;
  }

  // ✅ Shared email layout
  return `
  <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f3f4f6; padding: 40px; line-height: 1.6;">
    <div style="max-width: 640px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.08);">
      
      <!-- HEADER -->
      <div style="background: linear-gradient(135deg, #16a34a, #4ade80); padding: 35px; text-align: center;">
        <img src="https://res.cloudinary.com/drt2ymnfm/image/upload/v1754492778/logo_mxvbpu.png" alt="StayNext Logo" width="120" style="margin-bottom: 12px;" />
        <h2 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">${title}</h2>
      </div>
      
      <!-- BODY -->
      <div style="padding: 35px; text-align: center; font-size: 15px; color: #374151;">
        ${body}
      </div>
      
      <!-- FOOTER -->
      <div style="background-color: #f9fafb; text-align: center; padding: 18px; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} Stay Next. All rights reserved.<br/>
        <a href="${process.env.CLIENT_URL}" style="color:#16a34a; text-decoration:none;">Visit Website</a>
      </div>
    </div>
  </div>`;
};
