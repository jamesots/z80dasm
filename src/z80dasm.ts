export class Z80Dasm {
    symbols: {[addr: number]: string} = {};

    constructor() {
        this.buildCb();
        this.buildEd();
    }

    dasmMultiple(mem: number[], start: number, length: number) {
        let count = 0;
        let instructions = [];
        while (count < length) {
            const instr = this.dasmSingle(mem, start + count);
            instructions.push(instr);
            count += instr[1];
        }
        return instructions;
    }

    dasmSingle(mem: number[], start: number, opcodes = this.main, bytes = 0): [string, number] {
        let opcode = opcodes[mem[start]];
        if (opcode === 'BITS') {
            return this.dasmSingle(mem, (start + 1) % 0x10000, this.cb, 1);
        }
        if (opcode === 'EXTD') {
            return this.dasmSingle(mem, (start + 1) % 0x10000, this.ed, 1);
        }
        if (opcode.indexOf('nn') !== -1) {
            const num = this.get16bitNum(mem, start + 1);
            return [opcode.replace('nn', this.format16bitNum(num)), 3 + bytes, num];
        }
        if (opcode.indexOf('M') !== -1) {
            const num = this.get8bitNum(mem, start + 1);
            return [opcode.replace('M', this.format8bitNum(num)), 2 + bytes, num];
        }
        if (opcode.indexOf('E') !== -1) {
            // should be relative to next instruction - so
            // to jump back to a jr instruction it would be jr -2
            const num = this.get8bitRelative(mem, start + 1);
            return [opcode.replace('E', this.formatRelative(start + 2, num)), 2 + bytes, num];
        }
        return [opcode, 1 + bytes, null];
    }

    get16bitNum(mem: number[], start: number): number {
        return (mem[start % 0x10000] & 0xff) + ((mem[(start + 1) % 0x10000] & 0xff) * 256);
    }

    format16bitNum(num: number): string {
        if (this.symbols[num]) {
            return this.symbols[num];
        }
        let hex = num.toString(16);
        return '$' + '0'.repeat(4 - hex.length) + hex;
    }

    get8bitNum(mem: number[], start: number): number {
        return mem[start % 0x10000] & 0xff;
    }

    format8bitNum(num: number): string {
        if (this.symbols[num]) {
            return this.symbols[num];
        }
        let hex = num.toString(16);
        return '$' + '0'.repeat(4 - hex.length) + hex;
    }

    get8bitRelative(mem: number[], start: number): number {
        return mem[start % 0x10000] | 0xFFFFFF00;
    }

    formatRelative(addr: number, num: number): string {
        if (this.symbols[addr + num]) {
            return this.symbols[addr + num];
        }
        if (num >= 0) {
            return '+' + num;
        }
        return '' + num;
    }

    main = [
        'nop',
        'ld bc,nn',
        'ld (bc),a',
        'inc bc',
        'inc b',
        'dec b',
        'ld b,M',
        'rlca',
        'ex af,af\'',
        'add hl,bc',
        'ld a,(bc)',
        'dec bc',
        'inc c',
        'dec c',
        'ld c,M',
        'rrca',
        'djnz E',
        'ld de,nn',
        'ld (de),a',
        'inc de',
        'inc d',
        'dec d',
        'ld d,M',
        'rla',
        'jr E',
        'add hl,de',
        'ld a,(de)',
        'dec de',
        'inc e',
        'dec e',
        'ld e,M',
        'rra',
        'jr nz,E',
        'ld hl,nn',
        'ld (nn),hl',
        'inc hl',
        'inc h',
        'dec h',
        'ld h,M',
        'daa',
        'jr z,E',
        'add hl,hl',
        'ld hl,(nn)',
        'dec hl',
        'inc l',
        'dec l',
        'ld l,M',
        'cpl',
        'jr nc,E',
        'ld sp,nn',
        'ld (nn),a',
        'inc sp',
        'inc (hl)',
        'dec (hl)',
        'ld (hl),M',
        'scf',
        'jr c,E',
        'add hl,sp',
        'ld a,(nn)',
        'dec sp',
        'inc a',
        'dec a',
        'ld a,M',
        'ccf',
        'ld b,b',
        'ld b,c',
        'ld b,d',
        'ld b,e',
        'ld b,h',
        'ld b,l',
        'ld b,(hl)',
        'ld b,a',
        'ld c,b',
        'ld c,c',
        'ld c,d',
        'ld c,e',
        'ld c,h',
        'ld c,l',
        'ld c,(hl)',
        'ld c,a',
        'ld d,b',
        'ld d,c',
        'ld d,d',
        'ld d,e',
        'ld d,h',
        'ld d,l',
        'ld d,(hl)',
        'ld d,a',
        'ld e,b',
        'ld e,c',
        'ld e,d',
        'ld e,e',
        'ld e,h',
        'ld e,l',
        'ld e,(hl)',
        'ld e,a',
        'ld h,b',
        'ld h,c',
        'ld h,d',
        'ld h,e',
        'ld h,h',
        'ld h,l',
        'ld h,(hl)',
        'ld h,a',
        'ld l,b',
        'ld l,c',
        'ld l,d',
        'ld l,e',
        'ld l,h',
        'ld l,l',
        'ld l,(hl)',
        'ld l,a',
        'ld (hl),b',
        'ld (hl),c',
        'ld (hl),d',
        'ld (hl),e',
        'ld (hl),h',
        'ld (hl),l',
        'halt',
        'ld (hl),a',
        'ld a,b',
        'ld a,c',
        'ld a,d',
        'ld a,e',
        'ld a,h',
        'ld a,l',
        'ld a,(hl)',
        'ld a,a',
        'add a,b',
        'add a,c',
        'add a,d',
        'add a,e',
        'add a,h',
        'add a,l',
        'add a,(hl)',
        'add a,a',
        'adc a,b',
        'adc a,c',
        'adc a,d',
        'adc a,e',
        'adc a,h',
        'adc a,l',
        'adc a,(hl)',
        'adc a,a',
        'sub b',
        'sub c',
        'sub d',
        'sub e',
        'sub h',
        'sub l',
        'sub (hl)',
        'sub a',
        'sbc a,b',
        'sbc a,c',
        'sbc a,d',
        'sbc a,e',
        'sbc a,h',
        'sbc a,l',
        'sbc a,(hl)',
        'sbc a,a',
        'and b',
        'and c',
        'and d',
        'and e',
        'and h',
        'and l',
        'and (hl)',
        'and a',
        'xor b',
        'xor c',
        'xor d',
        'xor e',
        'xor h',
        'xor l',
        'xor (hl)',
        'xor a',
        'or b',
        'or c',
        'or d',
        'or e',
        'or h',
        'or l',
        'or (hl)',
        'or a',
        'cp b',
        'cp c',
        'cp d',
        'cp e',
        'cp h',
        'cp l',
        'cp (hl)',
        'cp a',
        'ret nz',
        'pop bc',
        'jp nz,nn',
        'jp nn',
        'call nz,nn',
        'push bc',
        'add a,M',
        'rst 00h',
        'ret z',
        'ret',
        'jp z,nn',
        'BITS',
        'call z,nn',
        'call nn',
        'adc a,M',
        'rst 08h',
        'ret nc',
        'pop de',
        'jp nc,nn',
        'out (M),a',
        'call nc,nn',
        'push de',
        'sub M',
        'rst 10h',
        'ret c',
        'exx',
        'jp c,nn',
        'in a,(M)',
        'call c,nn',
        'IX',
        'sbc a,M',
        'rst 18h',
        'ret po',
        'pop hl',
        'jp po,nn',
        'ex (sp),hl',
        'call po,nn',
        'push hl',
        'and M',
        'rst 20h',
        'ret pe',
        'jp (hl)',
        'jp pe,nn',
        'ex de,hl',
        'call pe,nn',
        'EXTD',
        'xor M',
        'rst 28h',
        'ret p',
        'pop af',
        'jp p,nn',
        'di',
        'call p,nn',
        'push af',
        'or M',
        'rst 30h',
        'ret m',
        'ld sp,hl',
        'jp m,nn',
        'ei',
        'call m,nn',
        'IY',
        'cp M',
        'rst 38h'
    ];

    cb = [];
    private buildCb() {
        const operands = ['b', 'c', 'd', 'e', 'h', 'l', '(hl)', 'a'];
        for (const instr of ['rlc', 'rrc', 'rl', 'rr', 'sla', 'sra', 'sll', 'srl']) {
            for (const operand of operands) {
                this.cb.push(instr + ' ' + operand);
            }
        }
        for (const instr of ['bit', 'res', 'set']) {
            for (let bit = 0; bit < 8; bit++) {
                for (const operand of operands) {
                    this.cb.push(instr + ' ' + bit + ',' + operand);
                }
            }
        }
    }

    buildEd() {
        this.ed.splice(0, 0, ...new Array(0x40));
        this.ed.splice(0x80, 0, ...new Array(0x20));
        this.ed.splice(0xC0, 0, ...new Array(0x40));
    }

    ed = [
'in b,(c)',
'out (c),b',
'sbc hl,bc',
'ld (**),bc',
'neg',
'retn',
'im 0',
'ld i,a',
'in c,(c)',
'out (c),c',
'adc hl,bc',
'ld bc,(**)',
'neg',
'reti',
'im 0/1',
'ld r,a',
'in d,(c)',
'out (c),d',
'sbc hl,de',
'ld (**),de',
'neg',
'retn',
'im 1',
'ld a,i',
'in e,(c)',
'out (c),e',
'adc hl,de',
'ld de,(**)',
'neg',
'retn',
'im 2',
'ld a,r',
'in h,(c)',
'out (c),h',
'sbc hl,hl',
'ld (**),hl',
'neg',
'retn',
'im 0',
'rrd',
'in l,(c)',
'out (c),l',
'adc hl,hl',
'ld hl,(**)',
'neg',
'retn',
'im 0/1',
'rld',
'in (c)',
'out (c),0',
'sbc hl,sp',
'ld (**),sp',
'neg',
'retn',
'im 1',
'',
'in a,(c)',
'out (c),a',
'adc hl,sp',
'ld sp,(**)',
'neg',
'retn',
'im 2',
'',
'ldi',
'cpi',
'ini',
'outi',
'',
'',
'',
'',
'ldd',
'cpd',
'ind',
'outd',
'',
'',
'',
'',
'ldir',
'cpir',
'inir',
'otir',
'',
'',
'',
'',
'lddr',
'cpdr',
'indr',
'otdr',
'',
'',
'',
''
    ]
}