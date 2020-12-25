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
            <xsl:apply-templates select="gpx:trkpt[(position() mod $cnt)&lt;1]"/><!-- keep only 1000 points -->
        </xsl:copy>
    </xsl:template>

    <xsl:template match="gpx:trkpt">
        <xsl:copy>
            <xsl:attribute name="lat">
                <xsl:value-of select="round(@lat*1000000) div 1000000"/><!-- réduction au mètre de la précision des traces (enlever les erreurs d'arrondi ex: 2.4157900000000003) : env. 1.11m -->
            </xsl:attribute>
            <xsl:attribute name="lon">
                <xsl:value-of select="round(@lon*1000000) div 1000000"/>
            </xsl:attribute>
            <xsl:apply-templates select="gpx:ele"/><!-- only keep these elements, the rest (time, temperature, ...) are not useful for our project-->
        </xsl:copy>
    </xsl:template>

    <xsl:template match="@lat">
        <xsl:attribute name="lat">
            <xsl:value-of select="round(text()*10000) div 10000"/>
        </xsl:attribute>
    </xsl:template>
    <xsl:template match="gpx:extensions"/> <!-- ignore those values -->
</xsl:stylesheet>