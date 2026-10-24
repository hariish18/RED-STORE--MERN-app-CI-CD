import { useState } from "react";
import { Form, Input, Button, Card, Alert } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { resetPassword } from "../JS/actions/auth.action";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Auth.css";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState({ password: "", confirm: "" });
    const [status, setStatus] = useState({ loading: false, error: null });

    const handleSubmit = async () => {
        if (passwords.password !== passwords.confirm) {
            setStatus({ loading: false, error: "Passwords do not match." });
            return;
        }
        setStatus({ loading: true, error: null });
        const result = await resetPassword(token, passwords.password);
        if (result.success) {
            navigate("/login");
        } else {
            setStatus({ loading: false, error: result.error });
        }
    };

    return (
        <div className="auth-page">
            <Card style={{ width: 400, margin: '80px auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <h2 className="auth-card__title" style={{ textAlign: 'center', marginBottom: 24 }}>Reset Password</h2>
                
                {status.error && <Alert message="Error" description={status.error} type="error" showIcon style={{ marginBottom: 16 }} />}

                <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item label="New password" name="password" rules={[{ required: true, message: 'Please enter a new password!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="New password" value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} size="large" />
                    </Form.Item>

                    <Form.Item label="Confirm password" name="confirm" rules={[{ required: true, message: 'Please confirm your password!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" style={{ backgroundColor: '#E63946', borderColor: '#E63946' }} loading={status.loading}>
                            Reset Password
                        </Button>
                    </Form.Item>
                </Form>

                <p className="auth-switch" style={{ textAlign: 'center' }}>
                    <Link to="/login">Back to Login</Link>
                </p>
            </Card>
        </div>
    );
}

export default ResetPassword;