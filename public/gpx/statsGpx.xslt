<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:gpx="http://www.topografix.com/GPX/1/1"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
>
    <!--Identity template,
            provides default behavior that copies all content into the output -->
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="gpx:trkseg">
        <xsl:variable name="cnt" select="count(gpx:trkpt) div 1000"/>
        <xsl:copy>
            <xsl:value-of select="count(gpx:trkpt[(position() mod $cnt)&lt;1])"/>
        </xsl:copy>
    </xsl:template>

    <xsl:template match="gpx:extensions"> <!-- ignore those -->
    </xsl:template>
</xsl:stylesheet>