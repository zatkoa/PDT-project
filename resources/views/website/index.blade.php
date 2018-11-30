@extends('layouts.app')
@section('content')
<select id="tagSelect" class="multipleSelect" multiple name="language">
</select>
<button class='accept'>CLICK ME</button>
<button class='potential'>POTENTIAL VILLAGES</button>
<div id="mapid"></div>
<div id="mySidenav" class="sidenav">
    <a href="javascript:void(0)" class="closebtn" >&times;</a>
    <div id='sidenav-content'>
    </div>
    <div id='legend'>
        <h3>Legenda</h3>
    </div>
</div>
@endsection
@push('scripts')
<script type="text/javascript" src="{{ asset('js/en.js') }}"></script>
<script type="text/javascript" src="{{ asset('js/sk.js') }}"></script>
<script src="{{ asset('js/config.js') }}"></script>
<script src="lib/fastselect/fastselect.standalone.js"></script>
<script>
    $(document).ready(function() {
        $('.multipleSelect').fastselect();
    });
</script>
{{--  <script src="{{ asset('js/website/main.js') }}"></script>  --}}


@endpush
