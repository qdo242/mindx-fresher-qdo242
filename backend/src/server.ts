import express from 'express';
import session from 'express-session';
import { Issuer } from 'openid-client';

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Proxy để nhận diện IP qua Ingress
app.set('trust proxy', 1);

app.use(session({
    name: 'mindx_session', 
    secret: process.env.SESSION_SECRET || 'quanda-mindx-onboarding-1210',
    resave: true, 
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

async function initAuth() {
    const oidcIssuer = await Issuer.discover(process.env.OIDC_ISSUER || 'https://id-dev.mindx.edu.vn');
    const client = new oidcIssuer.Client({
        client_id: process.env.CLIENT_ID!,
        client_secret: process.env.CLIENT_SECRET!,
        redirect_uris: [process.env.REDIRECT_URI!],
        response_types: ['code'],
    });

    
    app.get('/auth/login', (req: any, res: any) => {
        res.redirect(client.authorizationUrl({ scope: 'openid email profile' }));
    });

    app.get('/auth/callback', async (req: any, res: any) => {
        try {
            const params = client.callbackParams(req);
            const tokenSet = await client.callback(process.env.REDIRECT_URI!, params);
            const claims = tokenSet.claims();

            (req.session as any).user = {
                email: claims.email || (claims as any).preferred_username || claims.sub,
                name: claims.name || "User MindX"
            };

            req.session.save((err: any) => {
                if (err) return res.status(500).send("Session error");
                const frontendHome = process.env.REDIRECT_URI?.split('/api')[0] || '/';
                res.redirect(`${frontendHome}?t=${Date.now()}`);
            });
        } catch (error) {
            console.error('Lỗi Callback:', error);
            res.status(500).send("Authentication failed");
        }
    });

    app.get('/auth/me', (req: any, res: any) => {
        res.setHeader('Cache-Control', 'no-store'); 
        if ((req.session as any).user) {
            res.json((req.session as any).user);
        } else {
            
            res.status(401).json({ message: "Chưa đăng nhập" });
        }
    });

    app.get('/auth/logout', (req: any, res: any) => {
        req.session.destroy(() => {
            res.clearCookie('mindx_session', { path: '/' });
            const frontendHome = process.env.REDIRECT_URI?.split('/api')[0] || '/';
            res.redirect(frontendHome);
        });
    });

    app.get('/health', (req: any, res: any) => res.json({ status: 'UP' }));

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

initAuth().catch(console.error);