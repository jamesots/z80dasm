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

    dasmSingle(mem: number[], start: number, opcodes = this.main, bytes = 0, hl?): [string, number] {
        let opcode = opcodes[mem[start]];
        if (opcode === 'BITS') {
            return this.dasmSingle(mem, (start + 1) % 0x10000, this.cb, 1);
        }
        if (opcode === 'EXTD') {
            return this.dasmSingle(mem, (start + 1) % 0x10000, this.ed, 1);
        }
        if (opcode === 'IX') {
            return this.dasmSingle(mem, (start + 1) % 0x1000, this.main, 1, 'ix');
        }
        if (opcode === 'IY') {
            return this.dasmSingle(mem, (start + 1) % 0x1000, this.main, 1, 'iy');
        }
        if (hl !== undefined) {
            if (opcode.indexOf('(HL)') !== -1) {
                bytes++;
                let num = this.get8bitRelative(mem, start + 1);
                if (num >= 0) {
                    opcode = opcode.replace('HL', hl + ' + ' + num);
                } else {
                    opcode = opcode.replace('HL', hl + ' - ' + (-num));
                }
            }
            if (opcode.indexOf('HL') !== -1) {
                opcode = opcode.replace('HL', hl);
            } else if (opcode.indexOf('H') !== -1) {
                opcode = opcode.replace('H', hl + 'h');
            } else if (opcode.indexOf('L') !== -1) {
                opcode = opcode.replace('L', hl + 'l');
            }
        } else {
            opcode = opcode.replace('H', 'h');
            opcode = opcode.replace('L', 'l');
        }
        if (opcode.indexOf('nn') !== -1) {
            const num = this.get16bitNum(mem, start + 1);
            return [opcode.replace('nn', this.format16bitNum(num)), 3 + bytes];
        }
        if (opcode.indexOf('M') !== -1) {
            const num = this.get8bitNum(mem, start + 1);
            return [opcode.replace('M', this.format8bitNum(num)), 2 + bytes];
        }
        if (opcode.indexOf('E') !== -1) {
            // should be relative to next instruction - so
            // to jump back to a jr instruction it would be jr -2
            const num = this.get8bitRelative(mem, start + 1);
            return [opcode.replace('E', this.formatRelative(start + 2, num)), 2 + bytes];
        }
        return [opcode, 1 + bytes];
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
        let num = mem[start % 0x10000] & 0xFF;
        if (num & 0x80) {
            return -((~num & 0xFF) + 1);
        }
        return num;
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
        'add HL,bc',
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
        'add HL,de',
        'ld a,(de)',
        'dec de',
        'inc e',
        'dec e',
        'ld e,M',
        'rra',
        'jr nz,E',
        'ld HL,nn',
        'ld (nn),HL',
        'inc HL',
        'inc H',
        'dec H',
        'ld H,M',
        'daa',
        'jr z,E',
        'add HL,HL',
        'ld HL,(nn)',
        'dec HL',
        'inc L',
        'dec L',
        'ld L,M',
        'cpl',
        'jr nc,E',
        'ld sp,nn',
        'ld (nn),a',
        'inc sp',
        'inc (HL)',
        'dec (HL)',
        'ld (HL),M',
        'scf',
        'jr c,E',
        'add HL,sp',
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
        'ld b,H',
        'ld b,L',
        'ld b,(HL)',
        'ld b,a',
        'ld c,b',
        'ld c,c',
        'ld c,d',
        'ld c,e',
        'ld c,H',
        'ld c,L',
        'ld c,(HL)',
        'ld c,a',
        'ld d,b',
        'ld d,c',
        'ld d,d',
        'ld d,e',
        'ld d,H',
        'ld d,L',
        'ld d,(HL)',
        'ld d,a',
        'ld e,b',
        'ld e,c',
        'ld e,d',
        'ld e,e',
        'ld e,H',
        'ld e,L',
        'ld e,(HL)',
        'ld e,a',
        'ld H,b',
        'ld H,c',
        'ld H,d',
        'ld H,e',
        'ld H,H',
        'ld H,L',
        'ld H,(HL)',
        'ld H,a',
        'ld L,b',
        'ld L,c',
        'ld L,d',
        'ld L,e',
        'ld L,H',
        'ld L,L',
        'ld L,(HL)',
        'ld L,a',
        'ld (HL),b',
        'ld (HL),c',
        'ld (HL),d',
        'ld (HL),e',
        'ld (HL),H',
        'ld (HL),L',
        'halt',
        'ld (HL),a',
        'ld a,b',
        'ld a,c',
        'ld a,d',
        'ld a,e',
        'ld a,H',
        'ld a,L',
        'ld a,(HL)',
        'ld a,a',
        'add a,b',
        'add a,c',
        'add a,d',
        'add a,e',
        'add a,H',
        'add a,L',
        'add a,(HL)',
        'add a,a',
        'adc a,b',
        'adc a,c',
        'adc a,d',
        'adc a,e',
        'adc a,H',
        'adc a,L',
        'adc a,(HL)',
        'adc a,a',
        'sub b',
        'sub c',
        'sub d',
        'sub e',
        'sub H',
        'sub L',
        'sub (HL)',
        'sub a',
        'sbc a,b',
        'sbc a,c',
        'sbc a,d',
        'sbc a,e',
        'sbc a,H',
        'sbc a,L',
        'sbc a,(HL)',
        'sbc a,a',
        'and b',
        'and c',
        'and d',
        'and e',
        'and H',
        'and L',
        'and (HL)',
        'and a',
        'xor b',
        'xor c',
        'xor d',
        'xor e',
        'xor H',
        'xor L',
        'xor (HL)',
        'xor a',
        'or b',
        'or c',
        'or d',
        'or e',
        'or H',
        'or L',
        'or (HL)',
        'or a',
        'cp b',
        'cp c',
        'cp d',
        'cp e',
        'cp H',
        'cp L',
        'cp (HL)',
        'cp a',
        'ret nz',
        'pop bc',
        'jp nz,nn',
        'jp nn',
        'call nz,nn',
        'push bc',
        'add a,M',
        'rst $00',
        'ret z',
        'ret',
        'jp z,nn',
        'BITS',
        'call z,nn',
        'call nn',
        'adc a,M',
        'rst $08',
        'ret nc',
        'pop de',
        'jp nc,nn',
        'out (M),a',
        'call nc,nn',
        'push de',
        'sub M',
        'rst $10',
        'ret c',
        'exx',
        'jp c,nn',
        'in a,(M)',
        'call c,nn',
        'IX',
        'sbc a,M',
        'rst $18',
        'ret po',
        'pop HL',
        'jp po,nn',
        'ex (sp),HL',
        'call po,nn',
        'push HL',
        'and M',
        'rst $20',
        'ret pe',
        'jp (HL)',
        'jp pe,nn',
        'ex de,HL',
        'call pe,nn',
        'EXTD',
        'xor M',
        'rst $28',
        'ret p',
        'pop af',
        'jp p,nn',
        'di',
        'call p,nn',
        'push af',
        'or M',
        'rst $30',
        'ret m',
        'ld sp,HL',
        'jp m,nn',
        'ei',
        'call m,nn',
        'IY',
        'cp M',
        'rst $38'
    ];

    cb = [];
    private buildCb() {
        const operands = ['b', 'c', 'd', 'e', 'H', 'L', '(HL)', 'a'];
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
'sbc HL,bc',
'ld (**),bc',
'neg',
'retn',
'im 0',
'ld i,a',
'in c,(c)',
'out (c),c',
'adc HL,bc',
'ld bc,(**)',
'neg',
'reti',
'im 0/1',
'ld r,a',
'in d,(c)',
'out (c),d',
'sbc HL,de',
'ld (**),de',
'neg',
'retn',
'im 1',
'ld a,i',
'in e,(c)',
'out (c),e',
'adc HL,de',
'ld de,(**)',
'neg',
'retn',
'im 2',
'ld a,r',
'in H,(c)',
'out (c),H',
'sbc HL,HL',
'ld (**),HL',
'neg',
'retn',
'im 0',
'rrd',
'in L,(c)',
'out (c),L',
'adc HL,HL',
'ld HL,(**)',
'neg',
'retn',
'im 0/1',
'rld',
'in (c)',
'out (c),0',
'sbc HL,sp',
'ld (**),sp',
'neg',
'retn',
'im 1',
'',
'in a,(c)',
'out (c),a',
'adc HL,sp',
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