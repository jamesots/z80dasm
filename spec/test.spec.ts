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

        expect(dasm.dasmSingle([0x00], 0)).toEqual(['nop', 1, null]);

        expect(dasm.dasmSingle([0x01, 0x02, 0x03], 0)).toEqual(['ld bc,$0302', 3, 0x0302]);

        mem.set([0x01], 0xffff);
        mem.set([0x02, 0x03], 0x0000);
        expect(dasm.dasmSingle(Array.from(mem), 0xffff)).toEqual(['ld bc,$0302', 3, 0x0302])
    });

    it('should disassemble multiple instructions', function() {
        mem.set([0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x18, 0xFE], 0);
        let result = dasm.dasmMultiple(Array.from(mem), 0, 8);

        expect(result).toEqual([
            ['nop', 1, null],
            ['ld bc,$0302', 3, 0x0302],
            ['inc b', 1, null],
            ['dec b', 1, null],
            ['jr -2', 2, -2]
        ]);
    });


    it('should disassemble using symbol table', function() {
        mem.set([0x1, 0x2, 0x3, 0x18, 0xFE], 0);
        dasm.symbols[0x0302] = 'foo';
        dasm.symbols[0x0003] = 'bar';
        let result = dasm.dasmMultiple(Array.from(mem), 0, 5);

        expect(result).toEqual([
            ['ld bc,foo', 3, 0x0302],
            ['jr bar', 2, -2]
        ]);
    });

    it('should disassemble bit instructions', function() {
        mem.set([0xCB, 0x00, 0xCB, 0xA1], 0);
        let result = dasm.dasmMultiple(Array.from(mem), 0, 4);

        expect(result).toEqual([
            ['rlc b', 2, null],
            ['res 4,c', 2, null]
        ]);
    });
});