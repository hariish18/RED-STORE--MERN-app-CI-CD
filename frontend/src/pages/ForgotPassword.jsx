import { useState } from "react";
import { Form, Input, Button, Card, Alert } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { forgotPassword } from "../JS/actions/auth.action";
import { Link } from "react-router-dom";
import "./Auth.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({ loading: false, message: null, error: null });

    const handleSubmit = async () => {
        setStatus({ loading: true, message: null, error: null });
        const result = await forgotPassword(email.trim());
        setStatus(
            result.success
                ? { loading: false, message: result.message, error: null }
                : { loading: false, message: null, error: result.error }
        );
    };

    return (
        <div className="auth-page">
            <Card style={{ width: 400, margin: '80px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <h2 className="auth-card__title" style={{ textAlign: 'center', marginBottom: 24 }}>Forgot Password</h2>
                
                {status.error && <Alert message="Error" description={status.error} type="error" showIcon style={{ marginBottom: 16 }} />}
                {status.message && <Alert message="Success" description={status.message} type="success" showIcon style={{ marginBottom: 16 }} />}

                <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item label="Email address" name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email address!' }]}>
                        <Input prefix={<MailOutlined />} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} size="large" />
                    </Form.Item>
                    
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" style={{ backgroundColor: '#E63946', borderColor: '#E63946' }} loading={status.loading}>
                            Send Reset Link
                        </Button>
                    </Form.Item>
                </Form>

                <p className="auth-switch" style={{ textAlign: 'center' }}>
                    Remembered your password? <Link to="/login">Back to Login</Link>
                </p>
            </Card>
        </div>
    );
}

export default ForgotPassword;