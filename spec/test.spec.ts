import { Z80Dasm } from '../src/z80dasm';

describe('z80dasm', function() {
    it('should work', function() {
        let dasm = new Z80Dasm();
        expect(dasm.main.length).toBe(256);

        expect(dasm.disassemble([0x00])).toEqual(['nop', 1]);

        expect(dasm.disassemble([0x01, 0x02, 0x03])).toEqual(['ld bc,$0302', 3]);
    });
});