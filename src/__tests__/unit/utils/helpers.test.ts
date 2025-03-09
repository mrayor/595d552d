import { validateCorsOrigin } from '@utils/helpers';

describe('Utils - Helpers', () => {
    describe('validateCorsOrigin', () => {
        it('should allow any origin when ORIGIN is *', () => {
            const callback = jest.fn();
            const origin = 'http://example.com';
            const appOrigin = '*';

            validateCorsOrigin({ origin, callback, appOrigin });

            expect(callback).toHaveBeenCalledWith(null, true);
        });

        it('should allow when origin matches appOrigin', () => {
            const callback = jest.fn();
            const origin = 'http://example.com';
            const appOrigin = 'http://example.com';

            validateCorsOrigin({ origin, callback, appOrigin });

            expect(callback).toHaveBeenCalledWith(null, true);
        });

        it('should reject when origin does not match appOrigin', () => {
            const callback = jest.fn();
            const origin = 'http://example.com';
            const appOrigin = 'http://different.com';

            validateCorsOrigin({ origin, callback, appOrigin });

            expect(callback).toHaveBeenCalledWith(
                new Error('This site http://example.com does not have an access. Only specific domains are allowed to access it.'),
                false
            );
        });
    });
}); 