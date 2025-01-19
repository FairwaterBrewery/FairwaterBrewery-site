<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"  >
  <xsl:output method="xml" omit-xml-declaration="yes" encoding="UTF-8"/>

  <!-- **************************************** -->
  <xsl:template match="RECIPES">
    <xsl:apply-templates select="RECIPE"/>
  </xsl:template>

  <!-- **************************************** -->
  <xsl:template match="RECIPE">
    <h4>
      <xsl:value-of select="NAME" />
    </h4>
    <xsl:call-template name="Summary"/>
    <xsl:apply-templates select="FERMENTABLES"/>
	<br/>
	<xsl:apply-templates select="HOPS"/>
  </xsl:template>

  <!-- **************************************** -->
  <xsl:template name="Summary">
    <ul>
      <li>
        <xsl:text>Style: </xsl:text>
        <xsl:value-of select="STYLE/NAME" />
      </li>
      <li>
        <xsl:text>Length: </xsl:text>
        <xsl:value-of select="number(BATCH_SIZE)" />
        <xsl:text> litres</xsl:text>
      </li>
      <li>
        <xsl:text>Yeast: </xsl:text>
        <xsl:for-each select="YEASTS/YEAST">
          <xsl:value-of select="NAME" />
		  <xsl:text> (</xsl:text>
		  <xsl:value-of select="LABORATORY"/>
		  <xsl:text> </xsl:text>
		  <xsl:value-of select="PRODUCT_ID"/>
		  <xsl:text>)</xsl:text>
          <xsl:if test="position() = 1 and position() != last()">
            <xsl:text>, </xsl:text>
          </xsl:if>
        </xsl:for-each>
      </li>
      <li>
        <xsl:text>OG: </xsl:text>
        <xsl:value-of select="substring(EST_OG, 1, 5)" />
      </li>
      <li>
        <xsl:text>FG: </xsl:text>
        <xsl:value-of select="substring(EST_FG, 1, 5)" />
      </li>
	  <li>
        <xsl:text>ABV: </xsl:text>
        <xsl:value-of select="substring(EST_ABV, 1, 5)" />
      </li>
      <xsl:if test="count(EST_COLOR) &gt; 0">
        <li>
          <xsl:text>Colour: </xsl:text>
          <xsl:value-of select="EST_COLOR" />
        </li>
      </xsl:if>
      <xsl:if test="count(IBU) &gt; 0">
        <li>
          <xsl:text>Bitterness: </xsl:text>
          <xsl:value-of select="IBU" />
        </li>
      </xsl:if>
    </ul>
  </xsl:template>

  <!-- **************************************** -->
  <xsl:template match="FERMENTABLES">
	<xsl:variable name="TotalWeight" select="sum(FERMENTABLE/AMOUNT)" />
    <strong><xsl:text>Fermentables:</xsl:text></strong>
    <br/>
	<table width="90%">
		<tr>
			<th width="60%"><xsl:text>Name</xsl:text></th>
			<th width="10%"><xsl:text>Colour</xsl:text></th>
			<th width="20%"><xsl:text>Amount (kg)</xsl:text></th>
			<th width="10%"><xsl:text>%</xsl:text></th>
		</tr>
		<xsl:apply-templates select="FERMENTABLE">
			<xsl:with-param name="TotalWeight" select="$TotalWeight"/>
			<xsl:sort data-type="number" select="AMOUNT" order="descending" />
		</xsl:apply-templates>
		<tr>
			<td colspan="2"><strong>Total</strong></td>
			<td><xsl:value-of select="substring($TotalWeight, 1, 5)"/></td>
			<td></td>
		</tr>
	</table>
  </xsl:template>

  <xsl:template match="FERMENTABLE">
	<xsl:param name="TotalWeight" />
	<tr>
		<td><xsl:value-of select="NAME"/></td>
		<td><xsl:value-of select="round(number(COLOR))"/></td>
		<td><xsl:value-of select="substring(AMOUNT, 1, 5)"/></td>
		<td><xsl:value-of select="round((AMOUNT div $TotalWeight) * 100)" /></td>
	</tr>
  </xsl:template>

   <!-- **************************************** -->
     <xsl:template match="HOPS">
    <strong><xsl:text>Hops:</xsl:text></strong>
    <br/>
	<table width="90%">
		<tr>
			<th width="50%"><xsl:text>Name</xsl:text></th>
			<th width="10%"><xsl:text>Alpha</xsl:text></th>
			<th width="10%"><xsl:text>Form</xsl:text></th>
			<th width="20%"><xsl:text>Amount (g)</xsl:text></th>
			<th width="10%"><xsl:text>Time (mins)</xsl:text></th>
		</tr>
		<xsl:apply-templates select="HOP[USE='Mash']">
		  <xsl:sort data-type="number" select="TIME" order="descending" />
		  <xsl:sort data-type="number" select="number(AMOUNT)" order="descending" />
		</xsl:apply-templates>
		<xsl:apply-templates select="HOP[USE='First Wort']">
		  <xsl:sort data-type="number" select="TIME" order="descending" />
		  <xsl:sort data-type="number" select="number(AMOUNT)" order="descending" />
		</xsl:apply-templates>
		<xsl:apply-templates select="HOP[USE='Boil']">
		  <xsl:sort data-type="text" select="USE" order="ascending" />
		  <xsl:sort data-type="number" select="TIME" order="descending" />
		  <xsl:sort data-type="number" select="number(AMOUNT)" order="descending" />
		</xsl:apply-templates>
		<xsl:apply-templates select="HOP[USE='Aroma']">
		  <xsl:sort data-type="text" select="USE" order="ascending" />
		  <xsl:sort data-type="number" select="TIME" order="descending" />
		  <xsl:sort data-type="number" select="number(AMOUNT)" order="descending" />
		</xsl:apply-templates>
		<xsl:apply-templates select="HOP[USE='Dry Hop']">
		  <xsl:sort data-type="text" select="USE" order="ascending" />
		  <xsl:sort data-type="number" select="TIME" order="descending" />
		  <xsl:sort data-type="number" select="number(AMOUNT)" order="descending" />
		</xsl:apply-templates>
	</table>
  </xsl:template>

  <xsl:template match="HOP">
	<tr>
		<td><xsl:value-of select="NAME"/></td>
		<td><xsl:value-of select="number(ALPHA)"/></td>
		<td><xsl:value-of select="FORM"/></td>
		<td><xsl:value-of select="round(number(AMOUNT) * 1000)"/></td>
		<xsl:choose>
			<xsl:when test="USE='Boil'">
				<td><xsl:value-of select="number(TIME)"/></td>
			</xsl:when>
			<xsl:otherwise>
				<td><xsl:value-of select="USE"/></td>
			</xsl:otherwise>
		</xsl:choose>
	</tr>
  </xsl:template>
  
</xsl:stylesheet>