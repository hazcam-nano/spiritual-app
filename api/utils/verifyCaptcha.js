export async function verifyCaptcha(token) {
  try {
    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `response=${token}&secret=${process.env.HCAPTCHA_SECRET}`
    });

    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error("Captcha verification error:", err);
    return false;
  }
}

