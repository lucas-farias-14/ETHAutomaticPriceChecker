import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useEffect, useState } from "react";

interface numberOrNull {
  currentPrince : number|null|string
}

export default function EthCard(currentPrince : numberOrNull) {

  


  return(
  <Card className="p-4">
  <CardHeader>
    <CardTitle>Etherium Prices</CardTitle>
    <CardDescription>Shows realtime price in USD</CardDescription>
  </CardHeader>
  <CardContent>
    <p>{currentPrince.currentPrince !== null ? `$${currentPrince.currentPrince}` : 'Loading...'}</p>
  </CardContent>
</Card>
  );
}
