import { Z80Dasm } from '../src/z80dasm';

describe('z80dasm', function() {
    let dasm: Z80Dasm;
    let mem: Uint8Array;

    beforeEach(function() {
        dasm = new Z80Dasm();
        mem = new Uint8Array(0x10000);
    });

    it('should disassemble single instructions', function() {
        expect(dasm.main.length).toBe(256);

        expect(dasm.dasmSingle([0x00], 0)).toEqual(['nop', 1]);

        expect(dasm.dasmSingle([0x01, 0x02, 0x03], 0)).toEqual(['ld bc,$0302', 3]);

        mem.set([0x01], 0xffff);
        mem.set([0x02, 0x03], 0x0000);
        expect(dasm.dasmSingle(Array.from(mem), 0xffff)).toEqual(['ld bc,$0302', 3])
    });

    it('should disassemble multiple instructions', function() {
        mem.set([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x18, 0xFE, 0x18, 0x05], 0);
        let result = dasm.dasmMultiple(Array.from(mem), 0, 10);

        expect(result).toEqual([
            ['nop', 1],
            ['ld bc,$0302', 3],
            ['inc b', 1],
            ['dec b', 1],
            ['jr -2', 2],
            ['jr +5', 2]
        ]);
    });


    it('should disassemble using symbol table', function() {
        mem.set([0x1, 0x2, 0x3, 0x18, 0xFE], 0);
        dasm.symbols[0x0302] = 'foo';
        dasm.symbols[0x0003] = 'bar';
        let result = dasm.dasmMultiple(Array.from(mem), 0, 5);

        expect(result).toEqual([
            ['ld bc,foo', 3],
            ['jr bar', 2]
        ]);
    });

    it('should disassemble bit instructions', function() {
        mem.set([0xCB, 0x00, 0xCB, 0xA1], 0);
        let result = dasm.dasmMultiple(Array.from(mem), 0, 4);

        expect(result).toEqual([
            ['rlc b', 2],
            ['res 4,c', 2]
        ]);
    });

    it('should disassemble extended instructions', function() {
        mem.set([0xED, 0x40, 0xED, 0xA0], 0);
        let result = dasm.dasmMultiple(Array.from(mem), 0, 4);

        expect(result).toEqual([
            ['in b,(c)', 2],
            ['ldi', 2]
        ]);
    });

    it('should disassemble ix/iy instructions', function() {
        mem.set([0x24, 0x2C, 0x09, 0x34,
            0xDD, 0x24, 0xDD, 0x2C, 0xDD, 0x09, 0xDD, 0x34, 0x05, 0xDD, 0x34, 0xFE,
            0xFD, 0x24, 0xFD, 0x2C, 0xFD, 0x09, 0xFD, 0x34, 0x05, 0xFD, 0x34, 0xFe], 0);
        let result = dasm.dasmMultiple(Array.from(mem), 0, 28);

        expect(result).toEqual([
            ['inc h', 1],
            ['inc l', 1],
            ['add hl,bc', 1],
            ['inc (hl)', 1],
            ['inc ixh', 2],
            ['inc ixl', 2],
            ['add ix,bc', 2],
            ['inc (ix + 5)', 3],
            ['inc (ix - 2)', 3],
            ['inc iyh', 2],
            ['inc iyl', 2],
            ['add iy,bc', 2],
            ['inc (iy + 5)', 3],
            ['inc (iy - 2)', 3]
        ]);
    });

    it('should disassemble ix/iy bit instructions', function() {
        mem.set([0xDD, 0xCB, 0x00, 0x05,
            0xDD, 0xCB, 0x40, 0x05,
            0xDD, 0xCB, 0x80, 0x05], 0);
        let result = dasm.dasmMultiple(Array.from(mem), 0, 12);

        expect(result).toEqual([
            ['rlc (ix + 5),b', 4],
            ['bit 0,(ix + 5)', 4],
            ['res 0,(ix + 5),b', 4]
        ]);
    });
});