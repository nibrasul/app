import { NextResponse } from 'next/server';

// Android App Links verification
// TODO: Replace SHA256_CERT_FINGERPRINT with your release keystore fingerprint
// Run: keytool -list -v -keystore your-release-key.keystore
export async function GET() {
  const assetLinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'me.tapfolio.app',
        sha256_cert_fingerprints: [
          'REPLACE_WITH_YOUR_SHA256_FINGERPRINT',
        ],
      },
    },
  ];

  return new NextResponse(JSON.stringify(assetLinks), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
