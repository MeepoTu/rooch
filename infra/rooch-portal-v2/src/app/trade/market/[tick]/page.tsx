import MarketplaceView from 'src/sections/trade/market/view';

export const metadata = {
  title: 'Market | Orderbook',
};

export default function Page({ params }: { params: { tick: string } }) {
  return <MarketplaceView params={params} />;
}
