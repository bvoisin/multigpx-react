<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:g="http://www.topografix.com/GPX/1/1">
    <xsl:template match="/">
        <name>
            <xsl:value-of select="g:trk/g:name"/>
        </name>
    </xsl:template>
</xsl:stylesheet>