// eslint-disable-next-line no-control-regex
const RESTRICTED_CHAR = /[\x01-\x08\x0B-\x0C\x0E-\x1F\x7F-\x84\x86-\x9F]/g;

module.exports = function () {
    return {
        noColors:       true,
        report:         '',
        startTime:      null,
        uaList:         null,
        currentFixture: null,
        testCount:      0,
        skipped:        0,

        escapeXml (value) {
            return this.replaceIllegalCharacters(this.escapeHtml(value));
        },

        escapeCdata (value) {
            return this.replaceIllegalCharacters(value);
        },

        replaceIllegalCharacters (value) {
            return value.toString().replaceAll(RESTRICTED_CHAR, '�');
        },

        reportTaskStart (startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.uaList    = userAgents.join(', ');
            this.testCount = testCount;
        },

        reportFixtureStart (name, path) {
            this.currentFixture = { name: this.escapeXml(name), path: path };
        },

        _renderErrors (errs) {
            this.report += this.indentString('<failure>\n', 4);
            this.report += this.indentString('<![CDATA[', 4);

            errs.forEach((err, idx) => {
                err = this.formatError(err, `${idx + 1}) `);

                this.report += '\n';
                this.report += this.indentString(this.escapeCdata(err), 6);
                this.report += '\n';
            });

            this.report += this.indentString(']]>\n', 4);
            this.report += this.indentString('</failure>\n', 4);
        },

        reportTestDone (name, testRunInfo) {
            var hasErr = !!testRunInfo.errs.length;
            
            if (testRunInfo.unstable)
                name += ' (unstable)';
            var caseName = this.escapeXml(name);

            if (testRunInfo.screenshotPath)
                name += ` (screenshots: ${testRunInfo.screenshotPath})`;

            name = this.escapeXml(name);

            var openTag = `<testcase classname="${caseName.replace("Scenario: ", "").replace("Scenario Outline: ", "")}" ` +
                          `file="${this.escapeXml(this.currentFixture.path)}" ` +  
                          `time="${testRunInfo.durationMs / 1000}">\n`;

            this.report += this.indentString(openTag, 2);

            if (testRunInfo.skipped) {
                this.skipped++;
                this.report += this.indentString('<skipped/>\n', 4);
            }
            else if (hasErr)
                this._renderErrors(testRunInfo.errs);

            this.report += this.indentString('</testcase>\n', 2);
        },

        _renderWarnings (warnings) {
            this.setIndent(2)
                .write('<system-out>')
                .newline()
                .write('<![CDATA[')
                .newline()
                .setIndent(4)
                .write(`Warnings (${warnings.length}):`)
                .newline();

            warnings.forEach(msg => {
                this.setIndent(4)
                    .write('--')
                    .newline()
                    .setIndent(0)
                    .write(this.indentString(msg, 6))
                    .newline();
            });

            this.setIndent(2)
                .write(']]>')
                .newline()
                .write('</system-out>')
                .newline();
        },

        reportTaskDone (endTime, passed, warnings) {
            var name     = `TestCafe Tests: ${this.escapeXml(this.uaList)}`;
            var failures = this.testCount - passed;
            var time     = (endTime - this.startTime) / 1000;

            this.write('<?xml version="1.0" encoding="UTF-8" ?>')
                .newline()
                .write(`<testsuite name="${name}" tests="${this.testCount}" failures="${failures}" skipped="${this.skipped}"` +
                       ` errors="${failures}" time="${time}" timestamp="${endTime.toUTCString()}" >`)
                .newline()
                .write(this.report);

            if (warnings.length)
                this._renderWarnings(warnings);

            this.setIndent(0)
                .write('</testsuite>');
        }
    };
};
